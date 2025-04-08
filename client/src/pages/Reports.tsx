import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount, AttendanceSummary } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileSpreadsheet, Download } from 'lucide-react';
import { format, subDays } from 'date-fns';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const { data: classes, isLoading: loadingClasses } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });

  const handleExportData = async () => {
    if (!selectedClassId) {
      toast({
        title: "Class Required",
        description: "Please select a class to export data",
        variant: "destructive"
      });
      return;
    }
    
    // Format dates as YYYY-MM-DD
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : format(subDays(new Date(), 30), 'yyyy-MM-dd');
    
    // Generate export URL
    const exportUrl = `/api/export/attendance?classId=${selectedClassId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    
    // Download the file
    window.open(exportUrl, '_blank');
    
    const selectedClass = classes?.find(c => c.id === selectedClassId);
    
    toast({
      title: "Export started",
      description: `Exporting attendance data for ${selectedClass?.name || 'selected class'}`,
    });
  };

  const selectedClass = selectedClassId && classes ? classes.find(c => c.id === selectedClassId) : undefined;

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Attendance Reports</h2>
        <Button onClick={handleExportData} disabled={!selectedClassId}>
          <FileSpreadsheet className="h-4 w-4 mr-1" /> Export to Excel
        </Button>
      </div>

      {/* Filter Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <label className="block text-sm font-medium mb-1">Class</label>
              <Select 
                onValueChange={(value) => setSelectedClassId(value ? parseInt(value) : undefined)}
                defaultValue={selectedClassId?.toString() || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {!loadingClasses && classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      {selectedClassId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview: {selectedClass?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart classId={selectedClassId} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-neutral-500">Export attendance data for {selectedClass?.name} to analyze in Microsoft Excel or other spreadsheet applications.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center"
                    onClick={handleExportData}
                  >
                    <Download className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-medium">Download Full Report</span>
                    <span className="text-xs text-neutral-500 mt-1">Excel format (.xlsx)</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center"
                    onClick={() => {
                      setStartDate(new Date());
                      setEndDate(new Date());
                      setTimeout(() => handleExportData(), 100);
                    }}
                  >
                    <Download className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-medium">Today's Attendance Only</span>
                    <span className="text-xs text-neutral-500 mt-1">Excel format (.xlsx)</span>
                  </Button>
                </div>
                
                <div className="text-sm text-neutral-500 mt-6">
                  <p>Report includes:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Student details (roll numbers, names)</li>
                    <li>Daily attendance status</li>
                    <li>Present/absent totals</li>
                    <li>Attendance percentage calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {!selectedClassId && (
        <div className="text-center py-12 text-neutral-500">
          Select a class to view and generate attendance reports.
        </div>
      )}
    </div>
  );
};

export default Reports;
