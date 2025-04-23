import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { NoiseReport } from '@/types';
import { reports } from './storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || 'week';
  const status = searchParams.get('status');

  let filteredReports = [...reports];

  // Filter by time range
  const now = new Date();
  const days = timeRange === 'week' ? 7 : 30;
  const cutoffDate = new Date(now.setDate(now.getDate() - days));
  
  filteredReports = filteredReports.filter(report => 
    new Date(report.timestamp) >= cutoffDate
  );

  // Filter by status if provided
  if (status && status !== 'all') {
    filteredReports = filteredReports.filter(report => report.status === status);
  }

  return NextResponse.json(filteredReports);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newReport: NoiseReport = {
      id: uuidv4(),
      ...body,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    reports.push(newReport);

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const body = await request.json();

    const reportIndex = reports.findIndex(report => report.id === reportId);
    if (reportIndex === -1) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    reports[reportIndex] = {
      ...reports[reportIndex],
      ...body,
    };

    return NextResponse.json(reports[reportIndex]);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
} 