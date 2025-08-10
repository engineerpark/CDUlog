// 실외기케어 대시보드 - 우선순위 선택 컴포넌트
"use client"

import * as React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
  Clock,
  Calendar,
  Zap,
  Edit3
} from "lucide-react"
import type { PriorityLevel } from "@/lib/validations/maintenance"

// 우선순위 레벨 정의
const PRIORITY_LEVELS = [
  {
    value: 'low' as PriorityLevel,
    label: '낮음',
    description: '일반적인 정기 작업',
    icon: ArrowDown,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    iconColor: 'text-blue-600',
    urgencyDays: '7-14일 내'
  },
  {
    value: 'medium' as PriorityLevel,
    label: '보통',
    description: '적절한 시기에 처리',
    icon: Minus,
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    iconColor: 'text-yellow-600',
    urgencyDays: '3-7일 내'
  },
  {
    value: 'high' as PriorityLevel,
    label: '높음',
    description: '빠른 처리 필요',
    icon: ArrowUp,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    iconColor: 'text-orange-600',
    urgencyDays: '1-3일 내'
  },
  {
    value: 'urgent' as PriorityLevel,
    label: '긴급',
    description: '즉시 처리 필요',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    iconColor: 'text-red-600',
    urgencyDays: '즉시'
  }
] as const

interface PrioritySelectorProps {
  value?: PriorityLevel
  onValueChange: (value: PriorityLevel) => void
  className?: string
  disabled?: boolean
  showDescription?: boolean
  layout?: 'horizontal' | 'vertical' | 'compact'
}

export function PrioritySelector({
  value = 'medium',
  onValueChange,
  className = '',
  disabled = false,
  showDescription = true,
  layout = 'horizontal'
}: PrioritySelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customReason, setCustomReason] = useState('')

  const handlePriorityChange = (newPriority: PriorityLevel) => {
    onValueChange(newPriority)
    setShowCustomInput(false)
    setCustomReason('')
  }

  const getCurrentPriorityInfo = () => {
    return PRIORITY_LEVELS.find(level => level.value === value) || PRIORITY_LEVELS[1]
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-3'
      case 'compact':
        return 'flex flex-wrap gap-2'
      case 'horizontal':
      default:
        return 'grid grid-cols-2 gap-3 sm:grid-cols-4'
    }
  }

  const getButtonClasses = (isCompact: boolean) => {
    if (isCompact) {
      return 'flex items-center gap-1 px-3 py-2'
    }
    return 'flex flex-col items-center p-4 min-h-[100px] justify-center'
  }

  const currentInfo = getCurrentPriorityInfo()

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* 현재 선택된 우선순위 표시 */}
        {showDescription && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <currentInfo.icon className={`h-5 w-5 ${currentInfo.iconColor}`} />
              <div>
                <div className="font-medium text-sm">{currentInfo.label} 우선순위</div>
                <div className="text-xs text-muted-foreground">{currentInfo.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentInfo.urgencyDays}</span>
            </div>
          </div>
        )}

        {/* 우선순위 선택 버튼들 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">우선순위 선택</Label>
          <div className={getLayoutClasses()}>
            {PRIORITY_LEVELS.map((priority) => {
              const Icon = priority.icon
              const isSelected = value === priority.value
              const isCompact = layout === 'compact'
              
              return (
                <Tooltip key={priority.value}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handlePriorityChange(priority.value)}
                      className={`
                        relative border-2 rounded-lg transition-all
                        ${getButtonClasses(isCompact)}
                        ${isSelected 
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                          : 'border-muted hover:border-primary/30'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                      `}
                    >
                      {isCompact ? (
                        // 컴팩트 레이아웃
                        <>
                          <div className={`p-1 rounded ${isSelected ? priority.color : 'bg-muted'}`}>
                            <Icon className={`h-3 w-3 ${isSelected ? priority.iconColor : 'text-muted-foreground'}`} />
                          </div>
                          <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {priority.label}
                          </span>
                        </>
                      ) : (
                        // 기본 레이아웃
                        <>
                          <div className={`p-3 rounded-full mb-2 ${isSelected ? priority.color : 'bg-muted'}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? priority.iconColor : 'text-muted-foreground'}`} />
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {priority.label}
                            </div>
                            {showDescription && (
                              <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                {priority.urgencyDays}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {/* 선택 표시 */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Icon className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-medium">{priority.label} 우선순위</div>
                      <div className="text-xs opacity-90">{priority.description}</div>
                      <div className="text-xs opacity-75 mt-1">{priority.urgencyDays}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* 우선순위 가이드라인 */}
        {showDescription && !showCustomInput && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              우선순위 가이드라인
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-600">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-3 w-3" />
                <span><strong>낮음:</strong> 정기 점검, 예방 정비</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-3 w-3" />
                <span><strong>보통:</strong> 일반적인 수리 작업</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-3 w-3" />
                <span><strong>높음:</strong> 성능 저하, 빠른 조치</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                <span><strong>긴급:</strong> 안전 문제, 작동 중단</span>
              </div>
            </div>
          </div>
        )}

        {/* 커스텀 사유 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">우선순위 사유</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs h-6"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {showCustomInput ? '숨기기' : '사유 추가'}
            </Button>
          </div>
          
          {showCustomInput && (
            <div className="space-y-2">
              <Input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="우선순위 설정 사유를 입력하세요..."
                className="text-sm"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                선택한 우선순위의 근거나 특별한 사유를 기록할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 긴급 우선순위 경고 */}
        {value === 'urgent' && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Zap className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-red-800">긴급 우선순위 선택됨</div>
              <div className="text-xs text-red-600">
                이 작업은 즉시 처리가 필요합니다. 관련 담당자에게 알림이 발송되며, 
                24시간 이내 응답이 필요할 수 있습니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}