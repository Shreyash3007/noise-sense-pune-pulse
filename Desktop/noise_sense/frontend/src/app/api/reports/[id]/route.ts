import { NextResponse } from 'next/server';
import { NoiseReport } from '@/types';
import { reports } from '../storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const report = reports.find(report => report.id === params.id);
  
  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(report);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const reportIndex = reports.findIndex(report => report.id === params.id);

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const reportIndex = reports.findIndex(report => report.id === params.id);

  if (reportIndex === -1) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  reports.splice(reportIndex, 1);
  return NextResponse.json({ success: true });
} 