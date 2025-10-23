import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';
import { TRANSACTION_CONSTANTS } from './transaction-constants.tsx';
import { validateDateFormat, createTargetData, getStorageKeys } from './transaction-helpers.tsx';

export const dailyTargetsRoutes = new Hono();

// Enable CORS for all routes
dailyTargetsRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// GET /transactions/targets/:date - Get daily targets
dailyTargetsRoutes.get('/transactions/targets/:date', async (c) => {
  try {
    const date = c.req.param('date');
    
    if (!date || !validateDateFormat(date)) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INVALID_DATE_FORMAT
      }, 400);
    }
    
    const { dailyTargetsKey } = getStorageKeys('', date);
    const dailyTargets = await kv.get(dailyTargetsKey) || [];
    
    return c.json({
      success: true,
      data: dailyTargets
    });
  } catch (error) {
    console.log('Error fetching daily targets:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_FETCH
    }, 500);
  }
});

// POST /transactions/targets - Create daily target
dailyTargetsRoutes.post('/transactions/targets', async (c) => {
  try {
    const body = await c.req.json();
    const { targetType, targetValue, description, date } = body;
    
    if (!targetType || !targetValue || !date) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.TARGET_FIELDS_REQUIRED
      }, 400);
    }
    
    if (!validateDateFormat(date)) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INVALID_DATE_FORMAT
      }, 400);
    }
    
    const target = createTargetData(targetType, targetValue, description, date);
    
    const { dailyTargetsKey } = getStorageKeys('', date);
    const dailyTargets = await kv.get(dailyTargetsKey) || [];
    (dailyTargets as any[]).push(target);
    
    await kv.set(dailyTargetsKey, dailyTargets);
    
    return c.json({
      success: true,
      data: target,
      message: TRANSACTION_CONSTANTS.SUCCESS.TARGET_CREATED
    });
  } catch (error) {
    console.log('Error creating daily target:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_CREATE_TARGET
    }, 500);
  }
});

// PUT /transactions/targets/:id - Update daily target
dailyTargetsRoutes.put('/transactions/targets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { targetType, targetValue, description, date, isActive } = body;
    
    if (!date || !validateDateFormat(date)) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.INVALID_DATE_FORMAT
      }, 400);
    }
    
    const { dailyTargetsKey } = getStorageKeys('', date);
    const dailyTargets = await kv.get(dailyTargetsKey) || [];
    const targetIndex = (dailyTargets as any[]).findIndex((target: any) => target.id === id);
    
    if (targetIndex === -1) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.TARGET_NOT_FOUND
      }, 404);
    }
    
    (dailyTargets as any[])[targetIndex] = {
      ...(dailyTargets as any[])[targetIndex],
      targetType: targetType || (dailyTargets as any[])[targetIndex].targetType,
      targetValue: targetValue !== undefined ? parseFloat(targetValue.toString()) : (dailyTargets as any[])[targetIndex].targetValue,
      description: description !== undefined ? description : (dailyTargets as any[])[targetIndex].description,
      isActive: isActive !== undefined ? isActive : (dailyTargets as any[])[targetIndex].isActive,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(dailyTargetsKey, dailyTargets);
    
    return c.json({
      success: true,
      data: (dailyTargets as any[])[targetIndex],
      message: TRANSACTION_CONSTANTS.SUCCESS.TARGET_UPDATED
    });
  } catch (error) {
    console.log('Error updating daily target:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_UPDATE_TARGET
    }, 500);
  }
});

// DELETE /transactions/targets/:id - Delete daily target
dailyTargetsRoutes.delete('/transactions/targets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Find the target in all recent dates (last 7 days)
    const today = new Date();
    let deletedTarget = null;
    let targetDate = '';
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const { dailyTargetsKey } = getStorageKeys('', dateStr);
      const dailyTargets = await kv.get(dailyTargetsKey) || [];
      const targetIndex = (dailyTargets as any[]).findIndex((target: any) => target.id === id);
      
      if (targetIndex !== -1) {
        deletedTarget = (dailyTargets as any[]).splice(targetIndex, 1)[0];
        await kv.set(dailyTargetsKey, dailyTargets);
        targetDate = dateStr;
        break;
      }
    }
    
    if (!deletedTarget) {
      return c.json({ 
        success: false, 
        error: TRANSACTION_CONSTANTS.ERRORS.TARGET_NOT_FOUND
      }, 404);
    }
    
    return c.json({
      success: true,
      data: deletedTarget,
      message: TRANSACTION_CONSTANTS.SUCCESS.TARGET_DELETED
    });
  } catch (error) {
    console.log('Error deleting daily target:', error);
    return c.json({ 
      success: false, 
      error: TRANSACTION_CONSTANTS.ERRORS.FAILED_TO_DELETE_TARGET
    }, 500);
  }
});