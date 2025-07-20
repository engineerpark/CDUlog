import { NextRequest, NextResponse } from 'next/server';
import { OutdoorUnit, CreateOutdoorUnitRequest } from '../../types/outdoor-unit';

// 임시 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
let outdoorUnits: OutdoorUnit[] = [];
let nextId = 1;

// 샘플 데이터 초기화
const initializeSampleData = () => {
  if (outdoorUnits.length === 0) {
    const now = new Date().toISOString();
    const manufacturers = ['LG전자', '삼성전자', '대우전자', '캐리어'];
    const models = ['AC-2400X', 'AW-3600Y', 'CU-4800Z', 'DX-1800W'];
    const capacities = [18.0, 24.0, 36.0, 48.0];
    const statuses: ('active' | 'maintenance' | 'inactive')[] = ['active', 'maintenance', 'inactive'];

    // 1공장 실외기 10개
    for (let i = 1; i <= 10; i++) {
      const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const capacity = capacities[Math.floor(Math.random() * capacities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const installDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

      outdoorUnits.push({
        id: nextId.toString(),
        name: `1공장 실외기 ${i}호기`,
        model,
        manufacturer,
        serialNumber: `1F${nextId.toString().padStart(4, '0')}`,
        installationDate: installDate.toISOString().split('T')[0],
        location: `1공장 ${Math.floor((i-1)/5) + 1}동 ${((i-1) % 5) + 1}구역`,
        capacity,
        status,
        lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
        nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
        notes: i % 3 === 0 ? '정기점검 필요' : '',
        maintenanceRecords: [],
        createdAt: now,
        updatedAt: now
      });
      nextId++;
    }

    // 3공장 실외기 10개
    for (let i = 1; i <= 10; i++) {
      const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const capacity = capacities[Math.floor(Math.random() * capacities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const installDate = new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

      outdoorUnits.push({
        id: nextId.toString(),
        name: `3공장 실외기 ${i}호기`,
        model,
        manufacturer,
        serialNumber: `3F${nextId.toString().padStart(4, '0')}`,
        installationDate: installDate.toISOString().split('T')[0],
        location: `3공장 ${Math.floor((i-1)/5) + 1}동 ${((i-1) % 5) + 1}구역`,
        capacity,
        status,
        lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
        nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
        notes: i % 4 === 0 ? '교체 검토 필요' : '',
        maintenanceRecords: [],
        createdAt: now,
        updatedAt: now
      });
      nextId++;
    }
  }
};

export async function GET() {
  try {
    // 첫 번째 요청 시 샘플 데이터 초기화
    initializeSampleData();
    
    return NextResponse.json({
      success: true,
      data: outdoorUnits
    });
  } catch (error) {
    console.error('Error fetching outdoor units:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outdoor units' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOutdoorUnitRequest = await request.json();
    
    // 유효성 검사
    const requiredFields = ['name', 'model', 'manufacturer', 'serialNumber', 'installationDate', 'location', 'capacity'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateOutdoorUnitRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // 시리얼 번호 중복 검사
    const existingUnit = outdoorUnits.find(unit => unit.serialNumber === body.serialNumber);
    if (existingUnit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Serial number already exists' 
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUnit: OutdoorUnit = {
      id: nextId.toString(),
      ...body,
      createdAt: now,
      updatedAt: now
    };

    outdoorUnits.push(newUnit);
    nextId++;

    return NextResponse.json({
      success: true,
      data: newUnit
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create outdoor unit' },
      { status: 500 }
    );
  }
}