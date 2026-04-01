'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface InvoiceDetail {
  id: string;
  price: number;
  status: string;
  createdAt: string;
  courses: {
    id: string;
    name: string;
    slug: string;
  };
}

interface RevenueChartProps {
  invoiceDetails: InvoiceDetail[];
  startDate: string;
  endDate: string;
}

const chartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: '#2563eb',
  },
} satisfies ChartConfig;

function buildChartData(invoiceDetails: InvoiceDetail[]) {
  const map = new Map<string, number>();

  for (const invoice of invoiceDetails) {
    const d = new Date(invoice.createdAt);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const date = `${day}/${month}`;
    map.set(date, (map.get(date) ?? 0) + invoice.price);
  }

  return Array.from(map.entries())
    .sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number);
      const [dayB, monthB] = b[0].split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    })
    .map(([date, revenue]) => ({ date, revenue }));
}

function exportToExcel(invoiceDetails: InvoiceDetail[], startDate: string, endDate: string) {
  // Format data for Excel
  const excelData = invoiceDetails.map((invoice) => ({
    'ID Hóa đơn': invoice.id,
    'Tên khóa học': invoice.courses.name,
    'Giá': invoice.price,
    'Trạng thái': invoice.status,
    'Ngày tạo': format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi }),
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Doanh thu');

  // Set column widths
  ws['!cols'] = [
    { wch: 38 },
    { wch: 50 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
  ];

  // Format currency for price column
  const priceColumnIndex = 2;
  for (let i = 2; i <= excelData.length + 1; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: priceColumnIndex });
    if (ws[cellRef]) {
      ws[cellRef].z = '#,##0';
    }
  }

  // Generate filename with date range
  const fileName = `Doanh_thu_${format(new Date(startDate), 'dd-MM-yyyy')}_${format(new Date(endDate), 'dd-MM-yyyy')}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
}

export function RevenueChart({
  invoiceDetails,
  startDate,
  endDate,
}: RevenueChartProps) {
  const chartData = buildChartData(invoiceDetails);
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateRange: DateRange = {
    from: new Date(startDate),
    to: new Date(endDate),
  };

  function handleDateChange(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', format(range.from, 'yyyy-MM-dd'));
    params.set('endDate', format(range.to, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  }

  return (
    <Card className='py-3'>
      <CardHeader className="flex mb-10 items-center justify-between">
        <CardTitle>Doanh thu theo ngày</CardTitle>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-70 justify-start text-left font-normal')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from!, 'dd/MM/yyyy', { locale: vi })}
                {' – '}
                {format(dateRange.to!, 'dd/MM/yyyy', { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                locale={vi}
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button className='ml-2' onClick={() => exportToExcel(invoiceDetails, startDate, endDate)}>Xuất file</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            style={{
              minWidth: Math.max(chartData.length * 30 + 85, 300),
              height: 256,
            }}
          >
            <ChartContainer
              config={chartConfig}
              className="h-full w-full aspect-auto"
            >
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => v.toLocaleString('vi-VN')}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={85}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        (value as number).toLocaleString('vi-VN') + ' ₫'
                      }
                      labelFormatter={(label) => `Ngày ${label}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--color-revenue)', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
