// 실외기케어 대시보드 - 유지보수 폼 유효성 검사 스키마
import { z } from "zod"

// 유지보수 타입 
export const maintenanceTypes = [
  'preventive',   // 예방정비
  'corrective',   // 수정정비  
  'emergency',    // 응급정비
  'inspection'    // 점검
] as const

// 유지보수 상태
export const maintenanceStatuses = [
  'scheduled',    // 예정
  'in_progress',  // 진행중
  'completed',    // 완료
  'cancelled',    // 취소
  'on_hold'       // 대기
] as const

// 우선순위 레벨
export const priorityLevels = [
  'low',        // 낮음
  'medium',     // 보통
  'high',       // 높음
  'urgent'      // 긴급
] as const

// 유지보수 등록/수정 폼 스키마
export const maintenanceFormSchema = z.object({
  // 기본 정보
  title: z.string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이하로 입력해주세요"),
  
  description: z.string()
    .max(1000, "설명은 1000자 이하로 입력해주세요")
    .optional(),
  
  // 실외기 정보
  unit_id: z.string()
    .uuid("올바른 실외기를 선택해주세요"),
  
  // 유지보수 분류
  maintenance_type: z.enum(maintenanceTypes, {
    required_error: "유지보수 유형을 선택해주세요"
  }),
  
  status: z.enum(maintenanceStatuses, {
    required_error: "상태를 선택해주세요"  
  }),
  
  priority: z.enum(priorityLevels, {
    required_error: "우선순위를 선택해주세요"
  }),
  
  // 일정 정보
  scheduled_date: z.date({
    required_error: "예정일을 선택해주세요"
  }),
  
  estimated_duration: z.number()
    .min(1, "예상 소요시간은 1분 이상이어야 합니다")
    .max(2880, "예상 소요시간은 48시간(2880분)을 초과할 수 없습니다")
    .optional(),
    
  // 비용 정보  
  estimated_cost: z.number()
    .min(0, "예상 비용은 0원 이상이어야 합니다")
    .max(10000000, "예상 비용은 1000만원을 초과할 수 없습니다")
    .optional(),
    
  actual_cost: z.number()
    .min(0, "실제 비용은 0원 이상이어야 합니다")
    .max(10000000, "실제 비용은 1000만원을 초과할 수 없습니다")
    .optional(),
  
  // 작업 내용
  work_description: z.string()
    .max(2000, "작업 내용은 2000자 이하로 입력해주세요")
    .optional(),
    
  notes: z.string()
    .max(1000, "비고는 1000자 이하로 입력해주세요")
    .optional(),
    
  // 추가 정보
  parts_used: z.string()
    .max(500, "사용 부품은 500자 이하로 입력해주세요")
    .optional(),
    
  tools_used: z.string()
    .max(500, "사용 도구는 500자 이하로 입력해주세요")
    .optional(),
})

// 수정용 스키마 (일부 필드 선택적)
export const maintenanceUpdateSchema = maintenanceFormSchema.partial().extend({
  id: z.string().uuid("올바른 ID가 아닙니다")
})

// 유지보수 타입별 라벨
export const maintenanceTypeLabels: Record<typeof maintenanceTypes[number], string> = {
  preventive: '예방정비',
  corrective: '수정정비',
  emergency: '응급정비',
  inspection: '점검'
}

// 상태별 라벨
export const maintenanceStatusLabels: Record<typeof maintenanceStatuses[number], string> = {
  scheduled: '예정',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
  on_hold: '대기'
}

// 우선순위별 라벨
export const priorityLabels: Record<typeof priorityLevels[number], string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급'
}

// 타입 정의
export type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>
export type MaintenanceUpdateData = z.infer<typeof maintenanceUpdateSchema>
export type MaintenanceType = typeof maintenanceTypes[number]
export type MaintenanceStatus = typeof maintenanceStatuses[number]  
export type PriorityLevel = typeof priorityLevels[number]