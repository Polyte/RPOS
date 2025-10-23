import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useNotifications } from "./NotificationSystem";
import { HelpCircleIcon, MessageSquareIcon, AlertCircleIcon, BugIcon, LightbulbIcon, CreditCardIcon, SendIcon } from "lucide-react";

interface SupportRequestButtonProps {
  userRole: string;
  userName: string;
  userId: string;
  tenantId?: string;
  tenantName?: string;
  variant?: "default" | "outline" | "ghost" | "floating";
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface SupportRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
  userAgent: string;
  ipAddress: string;
  timestamp: string;
}

export function SupportRequestButton({ 
  userRole, 
  userName, 
  userId, 
  tenantId = 'default_tenant',
  tenantName = 'Default Tenant',
  variant = "outline",
  size = "md",
  className = ""
}: SupportRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportRequest, setSupportRequest] = useState({
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });

  const { addNotification } = useNotifications();

  const categoryOptions = [
    { value: 'technical', label: 'Technical Issue', icon: AlertCircleIcon, color: 'text-red-600' },
    { value: 'bug_report', label: 'Bug Report', icon: BugIcon, color: 'text-orange-600' },
    { value: 'feature_request', label: 'Feature Request', icon: LightbulbIcon, color: 'text-blue-600' },
    { value: 'billing', label: 'Billing Question', icon: CreditCardIcon, color: 'text-green-600' },
    { value: 'general', label: 'General Support', icon: HelpCircleIcon, color: 'text-gray-600' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const selectedCategory = categoryOptions.find(cat => cat.value === supportRequest.category);
  const selectedPriority = priorityOptions.find(pri => pri.value === supportRequest.priority);

  const handleSubmit = async () => {
    if (!supportRequest.subject.trim() || !supportRequest.description.trim()) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide both a subject and description for your support request.',
        duration: 4000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create support request object
      const request: SupportRequest = {
        id: `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        tenantName,
        userId,
        userName,
        userRole,
        subject: supportRequest.subject.trim(),
        description: supportRequest.description.trim(),
        category: supportRequest.category,
        priority: supportRequest.priority,
        userAgent: navigator.userAgent,
        ipAddress: '192.168.1.100', // In real implementation, this would come from the server
        timestamp: new Date().toISOString()
      };

      // Log the support request
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        tenantId,
        tenantName,
        userId,
        userName,
        userRole,
        action: 'SUPPORT_REQUEST_CREATED',
        description: `Support request created: ${supportRequest.subject}`,
        category: 'support' as const,
        severity: supportRequest.priority === 'urgent' ? 'critical' as const : 
                 supportRequest.priority === 'high' ? 'warning' as const : 'info' as const,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        metadata: {
          supportRequestId: request.id,
          category: supportRequest.category,
          priority: supportRequest.priority
        }
      };

      // Store system log safely
      try {
        const existingLogs = JSON.parse(localStorage.getItem('roxton-pos-system-logs') || '[]');
        existingLogs.unshift(logEntry);
        localStorage.setItem('roxton-pos-system-logs', JSON.stringify(existingLogs.slice(0, 1000))); // Keep last 1000 logs
      } catch (error) {
        console.warn('Failed to store system log:', error);
      }

      // Store support request in localStorage for demo (in real app, this would go to the server)
      const existingSupportRequests = JSON.parse(localStorage.getItem('roxton-pos-support-requests') || '[]');
      existingSupportRequests.push(request);
      localStorage.setItem('roxton-pos-support-requests', JSON.stringify(existingSupportRequests));



      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Send notification to multitenant manager (simulated)
      const managerNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'support_request' as const,
        timestamp: new Date().toISOString(),
        fromTenant: tenantName,
        fromUser: userName,
        fromRole: userRole,
        subject: supportRequest.subject,
        category: supportRequest.category,
        priority: supportRequest.priority,
        ticketId: request.id,
        read: false
      };

      const existingNotifications = JSON.parse(localStorage.getItem('roxton-pos-manager-notifications') || '[]');
      existingNotifications.unshift(managerNotification);
      localStorage.setItem('roxton-pos-manager-notifications', JSON.stringify(existingNotifications.slice(0, 100)));

      // Reset form
      setSupportRequest({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });

      setIsOpen(false);

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Support Request Submitted',
        message: `Your ${supportRequest.category.replace('_', ' ')} request has been sent to our support team. We'll respond within 24 hours.`,
        duration: 6000
      });

    } catch (error) {
      console.error('Error submitting support request:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Unable to submit your support request. Please try again later.',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'px-3 py-2 text-sm';
      case 'lg': return 'px-8 py-4 text-lg';
      default: return 'px-6 py-3';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'default': return 'gradient-secondary text-white shadow-luxury hover-lift';
      case 'ghost': return 'hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'floating': return 'gradient-accent text-white shadow-luxury hover-lift rounded-full';
      default: return 'border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`${getButtonVariant()} ${getButtonSize()} ${className}`}
          disabled={isSubmitting}
        >
          <HelpCircleIcon className="w-4 h-4 mr-2" />
          {variant === 'floating' ? '' : 'Support'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 gradient-secondary rounded-lg">
              <MessageSquareIcon className="w-6 h-6 text-white" />
            </div>
            Request Support
          </DialogTitle>
          <DialogDescription>
            Get help from our support team. We'll respond as quickly as possible based on your request priority.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* User Context Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">User:</span>
                <span className="ml-2 font-semibold">{userName}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 font-semibold capitalize">{userRole.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Tenant:</span>
                <span className="ml-2 font-semibold">{tenantName}</span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="ml-2 font-semibold">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <Label htmlFor="support-category" className="text-base font-semibold mb-3 block">
              What type of support do you need? *
            </Label>
            <Select
              value={supportRequest.category}
              onValueChange={(value: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general') => 
                setSupportRequest(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selection */}
          <div>
            <Label htmlFor="support-priority" className="text-base font-semibold mb-3 block">
              How urgent is this request? *
            </Label>
            <Select
              value={supportRequest.priority}
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setSupportRequest(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-3">
                      <Badge className={`px-2 py-1 text-xs ${option.color}`}>
                        {option.label}
                      </Badge>
                      <span>
                        {option.value === 'urgent' && '🔥 Business Critical'}
                        {option.value === 'high' && '⚡ Important'}
                        {option.value === 'medium' && '📋 Normal'}
                        {option.value === 'low' && '💭 When Convenient'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="support-subject" className="text-base font-semibold mb-3 block">
              Subject *
            </Label>
            <Input
              id="support-subject"
              placeholder="Brief description of your issue or request..."
              value={supportRequest.subject}
              onChange={(e) => setSupportRequest(prev => ({ ...prev, subject: e.target.value }))}
              className="h-12 text-lg"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {supportRequest.subject.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="support-description" className="text-base font-semibold mb-3 block">
              Detailed Description *
            </Label>
            <Textarea
              id="support-description"
              placeholder="Please provide as much detail as possible about your issue or request. Include any error messages, steps to reproduce the problem, or specific requirements..."
              value={supportRequest.description}
              onChange={(e) => setSupportRequest(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[120px] text-base"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {supportRequest.description.length}/2000 characters
            </p>
          </div>

          {/* Expected Response Time */}
          {selectedPriority && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Expected Response Time
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {supportRequest.priority === 'urgent' && 'Within 2 hours during business hours'}
                    {supportRequest.priority === 'high' && 'Within 4 hours during business hours'}  
                    {supportRequest.priority === 'medium' && 'Within 24 hours'}
                    {supportRequest.priority === 'low' && 'Within 48-72 hours'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!supportRequest.subject.trim() || !supportRequest.description.trim() || isSubmitting}
            className="flex-1 gradient-secondary text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}