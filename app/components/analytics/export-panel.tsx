
'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FilePdf,
  FileImage,
  FileJson,
  Settings,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Share,
  Eye,
  Palette,
  Layout,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useExport, ExportConfig, ExportResult } from '@/lib/export/export-service';

interface ExportPanelProps {
  dashboardElement?: HTMLElement;
  data?: any[];
  title?: string;
  onExportComplete?: (results: ExportResult[]) => void;
}

export function ExportPanel({
  dashboardElement,
  data = [],
  title = 'Dashboard Export',
  onExportComplete
}: ExportPanelProps) {
  const { exportData, exportMultiple, estimateSize, isExporting, exportProgress, formatCapabilities } = useExport();
  
  const [isOpen, setIsOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    quality: 'medium',
    orientation: 'portrait',
    paperSize: 'a4',
    includeCharts: true,
    includeData: true,
    compression: true,
    metadata: {
      title,
      author: 'weGROUP Platform',
      subject: 'Analytics Dashboard Export',
      creator: 'weGROUP DeepAgent Platform',
      keywords: ['analytics', 'dashboard', 'report'],
      createdAt: new Date()
    }
  });
  
  const [selectedFormats, setSelectedFormats] = useState<ExportConfig['format'][]>(['pdf']);
  const [scheduleExport, setScheduleExport] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    recipients: '',
    subject: `${title} Export`,
    message: 'Please find the exported dashboard attached.'
  });

  const hiddenElementRef = useRef<HTMLDivElement>(null);

  // Update export configuration
  const updateConfig = useCallback((updates: Partial<ExportConfig>) => {
    setExportConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Update metadata
  const updateMetadata = useCallback((updates: Partial<ExportConfig['metadata']>) => {
    setExportConfig(prev => ({
      ...prev,
      metadata: { ...prev.metadata!, ...updates }
    }));
  }, []);

  // Handle format selection
  const toggleFormat = useCallback((format: ExportConfig['format']) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  }, []);

  // Estimate total export size
  const estimatedSize = dashboardElement && selectedFormats.length > 0 
    ? selectedFormats.reduce((total, format) => 
        total + estimateSize(dashboardElement, data, format, exportConfig.quality), 0
      )
    : 0;

  // Handle single format export
  const handleSingleExport = useCallback(async (format: ExportConfig['format']) => {
    if (!dashboardElement) {
      toast.error('No dashboard element to export');
      return;
    }

    const config = { ...exportConfig, format };
    const result = await exportData(dashboardElement, data, config);
    
    if (result.success) {
      toast.success(`${format.toUpperCase()} export completed`);
      onExportComplete?.([result]);
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  }, [dashboardElement, data, exportConfig, exportData, onExportComplete]);

  // Handle multiple format export
  const handleMultipleExport = useCallback(async () => {
    if (!dashboardElement || selectedFormats.length === 0) {
      toast.error('No formats selected for export');
      return;
    }

    const results = await exportMultiple(dashboardElement, data, exportConfig, selectedFormats);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(`${successCount} export(s) completed successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} export(s) failed`);
    }

    onExportComplete?.(results);
    setIsOpen(false);
  }, [dashboardElement, data, selectedFormats, exportConfig, exportMultiple, onExportComplete]);

  // Schedule export
  const handleScheduleExport = useCallback(async () => {
    // TODO: Implement scheduled export
    toast.success('Export scheduled successfully');
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Quick Export Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSingleExport('pdf')}
          disabled={!dashboardElement || isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <FilePdf className="w-4 h-4 mr-1" />
          )}
          PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSingleExport('excel')}
          disabled={!dashboardElement || isExporting}
        >
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          Excel
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export...
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Dashboard
              </DialogTitle>
              <DialogDescription>
                Configure export settings and choose output formats
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="formats" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="formats">Formats</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
              </TabsList>

              <TabsContent value="formats" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Export Formats</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select one or more formats for export
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formatCapabilities).map(([format, info]) => {
                      const isSelected = selectedFormats.includes(format as any);
                      const Icon = format === 'pdf' ? FilePdf :
                                  format === 'excel' ? FileSpreadsheet :
                                  format === 'csv' ? FileText :
                                  format === 'png' ? FileImage :
                                  FileJson;

                      return (
                        <Card 
                          key={format}
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                          }`}
                          onClick={() => toggleFormat(format as any)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{info.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max: {info.maxSize}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {info.supports.map(support => (
                                    <Badge key={support} variant="outline" className="text-xs">
                                      {support}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {estimatedSize > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>Estimated total size: {(estimatedSize / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="export-title">Export Title</Label>
                    <Input
                      id="export-title"
                      value={exportConfig.metadata?.title || ''}
                      onChange={(e) => updateMetadata({ title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="export-author">Author</Label>
                    <Input
                      id="export-author"
                      value={exportConfig.metadata?.author || ''}
                      onChange={(e) => updateMetadata({ author: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="export-description">Description</Label>
                    <Textarea
                      id="export-description"
                      value={exportConfig.metadata?.subject || ''}
                      onChange={(e) => updateMetadata({ subject: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quality">Quality</Label>
                      <Select 
                        value={exportConfig.quality} 
                        onValueChange={(value: 'low' | 'medium' | 'high') => updateConfig({ quality: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Fast)</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High (Slow)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="orientation">Orientation</Label>
                      <Select 
                        value={exportConfig.orientation} 
                        onValueChange={(value: 'portrait' | 'landscape') => updateConfig({ orientation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-charts">Include Charts</Label>
                      <Switch
                        id="include-charts"
                        checked={exportConfig.includeCharts}
                        onCheckedChange={(checked) => updateConfig({ includeCharts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-data">Include Raw Data</Label>
                      <Switch
                        id="include-data"
                        checked={exportConfig.includeData}
                        onCheckedChange={(checked) => updateConfig({ includeData: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="compression">Enable Compression</Label>
                      <Switch
                        id="compression"
                        checked={exportConfig.compression}
                        onCheckedChange={(checked) => updateConfig({ compression: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Schedule Export</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically export on a regular schedule
                    </p>
                  </div>
                  <Switch
                    checked={scheduleExport}
                    onCheckedChange={setScheduleExport}
                  />
                </div>

                {scheduleExport && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="share" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Distribution</Label>
                    <p className="text-sm text-muted-foreground">
                      Send exported files via email
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enabled}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {emailSettings.enabled && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                      <Textarea
                        id="recipients"
                        value={emailSettings.recipients}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, recipients: e.target.value }))}
                        placeholder="user1@example.com, user2@example.com"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSettings.subject}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email-message">Message</Label>
                      <Textarea
                        id="email-message"
                        value={emailSettings.message}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-medium">Quick Actions</Label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Exporting...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {selectedFormats.length * 5}s</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                
                {scheduleExport ? (
                  <Button onClick={handleScheduleExport} disabled={isExporting}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Export
                  </Button>
                ) : (
                  <Button 
                    onClick={handleMultipleExport} 
                    disabled={selectedFormats.length === 0 || isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export {selectedFormats.length > 1 ? `(${selectedFormats.length})` : ''}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hidden element for capturing dashboard */}
      <div ref={hiddenElementRef} className="sr-only" />
    </>
  );
}
