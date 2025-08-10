// 실외기케어 대시보드 - 유지보수 등록/수정 폼 컴포넌트
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatusSelector } from "@/components/maintenance/status-selector"
import { PrioritySelector } from "@/components/maintenance/priority-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createMaintenance, updateMaintenance } from "@/app/actions/maintenance"
import {
  maintenanceFormSchema,
  maintenanceTypeLabels,
  maintenanceStatusLabels,
  priorityLabels,
  type MaintenanceFormData,
  type MaintenanceType,
  type MaintenanceStatus,
  type PriorityLevel
} from "@/lib/validations/maintenance"
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Settings,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react"

interface Unit {
  id: string
  name: string
  location: string
  status: string
}

interface MaintenanceLog {
  id: string
  title: string
  description?: string
  unit_id: string
  maintenance_type: MaintenanceType
  status: MaintenanceStatus
  priority: PriorityLevel
  scheduled_date: string
  estimated_duration?: number
  estimated_cost?: number
  actual_cost?: number
  work_description?: string
  notes?: string
  parts_used?: string
  tools_used?: string
}

interface MaintenanceFormProps {
  units: Unit[]
  maintenance?: MaintenanceLog
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function MaintenanceForm({ 
  units, 
  maintenance, 
  trigger, 
  onSuccess 
}: MaintenanceFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isEditing = !!maintenance

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: maintenance?.title || "",
      description: maintenance?.description || "",
      unit_id: maintenance?.unit_id || "",
      maintenance_type: maintenance?.maintenance_type || "inspection",
      status: maintenance?.status || "scheduled",
      priority: maintenance?.priority || "medium",
      scheduled_date: maintenance?.scheduled_date 
        ? new Date(maintenance.scheduled_date) 
        : new Date(),
      estimated_duration: maintenance?.estimated_duration || undefined,
      estimated_cost: maintenance?.estimated_cost || undefined,
      actual_cost: maintenance?.actual_cost || undefined,
      work_description: maintenance?.work_description || "",
      notes: maintenance?.notes || "",
      parts_used: maintenance?.parts_used || "",
      tools_used: maintenance?.tools_used || "",
    },
  })

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      let result
      if (isEditing) {
        result = await updateMaintenance(maintenance.id, data)
      } else {
        result = await createMaintenance(data)
      }

      if (result.success) {
        setOpen(false)
        form.reset()
        onSuccess?.()
        router.refresh()
      } else {
        setError(result.error || '오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError('예기치 않은 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMaintenanceTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case 'preventive':
        return <CheckCircle2 className="h-4 w-4" />
      case 'corrective':
        return <Settings className="h-4 w-4" />
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />
      case 'inspection':
        return <FileText className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {isEditing ? '유지보수 수정' : '유지보수 등록'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? '유지보수 이력을 수정합니다. 필요한 정보를 업데이트하세요.'
              : '새로운 유지보수 작업을 등록합니다. 필수 정보를 입력하세요.'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* 기본 정보 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목 *</FormLabel>
                        <FormControl>
                          <Input placeholder="유지보수 작업 제목" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>실외기 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="실외기를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  {unit.name} - {unit.location}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="유지보수 작업에 대한 상세 설명을 입력하세요"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        유지보수 작업의 배경이나 목적을 설명해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 분류 및 상태 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  분류 및 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="maintenance_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>유지보수 유형 *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {Object.entries(maintenanceTypeLabels).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2">
                              <RadioGroupItem value={value} id={value} />
                              <Label htmlFor={value} className="flex items-center gap-2 cursor-pointer">
                                {getMaintenanceTypeIcon(value as MaintenanceType)}
                                {label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>상태 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(maintenanceStatusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>우선순위 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(priorityLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getPriorityColor(value as PriorityLevel)}`}>
                                    {label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 일정 및 비용 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  일정 및 비용
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>예정일 *</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onDateChange={field.onChange}
                            placeholder="예정일을 선택하세요"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          예상 소요시간 (분)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3" />
                          예상 비용 (원)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <FormField
                    control={form.control}
                    name="actual_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3" />
                          실제 비용 (원)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="45000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          작업 완료 후 실제 소요된 비용을 입력하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* 작업 세부사항 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  작업 세부사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="work_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>작업 내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="수행할 작업의 구체적인 내용을 설명하세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        실시할 점검 항목, 교체할 부품, 수리 방법 등을 상세히 기록하세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parts_used"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 부품</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="필터, 센서, 부품명 등"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tools_used"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 도구</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="드라이버, 멀티미터, 청소도구 등"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비고</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="특이사항, 주의사항, 추가 메모 등"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        작업 중 발견한 문제점이나 향후 주의사항을 기록하세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? '수정하기' : '등록하기'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}