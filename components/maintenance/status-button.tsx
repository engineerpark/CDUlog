// 실외기케어 대시보드 - 유지보수 상태 변경 버튼 컴포넌트
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateMaintenanceStatus } from "@/app/actions/maintenance"
import {
  maintenanceStatusLabels,
  type MaintenanceStatus
} from "@/lib/validations/maintenance"
import {
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Pause,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Edit3
} from "lucide-react"

interface StatusButtonProps {
  maintenanceId: string
  currentStatus: MaintenanceStatus
  disabled?: boolean
  showLabel?: boolean
}

export function MaintenanceStatusButton({ 
  maintenanceId, 
  currentStatus, 
  disabled = false,
  showLabel = true 
}: StatusButtonProps) {
  const [open, setOpen] = useState(false)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customStatus, setCustomStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getStatusConfig = (status: MaintenanceStatus) => {
    const configs = {
      scheduled: {
        icon: Calendar,
        label: '예정',
        color: 'bg-blue-100 text-blue-800',
        iconColor: 'text-blue-600'
      },
      in_progress: {
        icon: Clock,
        label: '진행중',
        color: 'bg-orange-100 text-orange-800',
        iconColor: 'text-orange-600'
      },
      completed: {
        icon: CheckCircle2,
        label: '완료',
        color: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
      },
      cancelled: {
        icon: XCircle,
        label: '취소',
        color: 'bg-red-100 text-red-800',
        iconColor: 'text-red-600'
      },
      on_hold: {
        icon: Pause,
        label: '대기',
        color: 'bg-gray-100 text-gray-800',
        iconColor: 'text-gray-600'
      }
    }
    return configs[status]
  }

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    if (newStatus === currentStatus) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateMaintenanceStatus(maintenanceId, newStatus)
      
      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        setError(result.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Status change error:', error)
      setError('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomStatusSubmit = async () => {
    if (!customStatus.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // 커스텀 상태는 notes나 별도 필드에 저장할 수 있지만, 
      // 현재는 기본 상태 중 가장 가까운 것으로 매핑
      const mappedStatus = mapCustomToStandardStatus(customStatus)
      const result = await updateMaintenanceStatus(maintenanceId, mappedStatus)
      
      if (result.success) {
        setCustomDialogOpen(false)
        setCustomStatus('')
        router.refresh()
      } else {
        setError(result.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Custom status change error:', error)
      setError('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 커스텀 상태를 표준 상태로 매핑하는 함수
  const mapCustomToStandardStatus = (custom: string): MaintenanceStatus => {
    const lower = custom.toLowerCase()
    
    if (lower.includes('완료') || lower.includes('끝') || lower.includes('마감')) {
      return 'completed'
    }
    if (lower.includes('진행') || lower.includes('작업') || lower.includes('수행')) {
      return 'in_progress'
    }
    if (lower.includes('취소') || lower.includes('중단')) {
      return 'cancelled'
    }
    if (lower.includes('대기') || lower.includes('보류') || lower.includes('연기')) {
      return 'on_hold'
    }
    
    return 'scheduled' // 기본값
  }

  const currentConfig = getStatusConfig(currentStatus)
  const CurrentIcon = currentConfig.icon

  // 다음 가능한 상태들을 제안
  const getNextPossibleStatuses = (): MaintenanceStatus[] => {
    switch (currentStatus) {
      case 'scheduled':
        return ['in_progress', 'cancelled', 'on_hold']
      case 'in_progress':
        return ['completed', 'on_hold', 'cancelled']
      case 'on_hold':
        return ['in_progress', 'scheduled', 'cancelled']
      case 'completed':
        return ['in_progress'] // 완료된 작업 재작업
      case 'cancelled':
        return ['scheduled', 'in_progress']
      default:
        return ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            className="h-auto p-1 justify-start"
          >
            <Badge className={`${currentConfig.color} flex items-center gap-1`}>
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CurrentIcon className="h-3 w-3" />
              )}
              {showLabel && currentConfig.label}
              {!disabled && <ChevronDown className="h-3 w-3 ml-1" />}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>상태 변경</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {getNextPossibleStatuses().map((status) => {
            const config = getStatusConfig(status)
            const StatusIcon = config.icon
            
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <StatusIcon className={`h-4 w-4 ${config.iconColor}`} />
                <span>{config.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {maintenanceStatusLabels[status]}
                </Badge>
              </DropdownMenuItem>
            )
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(false)
              setCustomDialogOpen(true)
            }}
            className="flex items-center gap-2 cursor-pointer text-blue-600"
          >
            <Edit3 className="h-4 w-4" />
            <span>직접 입력</span>
          </DropdownMenuItem>
          
          {error && (
            <div className="p-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 커스텀 상태 입력 다이얼로그 */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              상태 직접 입력
            </DialogTitle>
            <DialogDescription>
              특별한 상태나 세부 상황을 직접 입력하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customStatus">상태 설명</Label>
              <Input
                id="customStatus"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="예: 부품 대기중, 재검토 필요, 추가 확인 중..."
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                입력한 내용은 가장 적절한 기본 상태로 자동 변환됩니다.
              </p>
            </div>

            {/* 추천 키워드 */}
            <div className="space-y-2">
              <Label className="text-xs">빠른 입력</Label>
              <div className="flex flex-wrap gap-1">
                {[
                  '작업 완료',
                  '부품 대기중',
                  '재검토 필요',
                  '추가 확인',
                  '일시 중단',
                  '우선순위 변경'
                ].map((keyword) => (
                  <Button
                    key={keyword}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setCustomStatus(keyword)}
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCustomDialogOpen(false)
                setCustomStatus('')
                setError(null)
              }}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleCustomStatusSubmit}
              disabled={!customStatus.trim() || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}