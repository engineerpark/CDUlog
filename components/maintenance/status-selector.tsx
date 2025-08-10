// 실외기케어 대시보드 - 4가지 상태 버튼 및 커스텀 입력 컴포넌트
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertTriangle,
  Settings,
  Wrench,
  Edit3,
  Info
} from "lucide-react"

// 기본 상태 정의
const DEFAULT_STATUSES = [
  {
    value: 'normal',
    label: '정상',
    description: '정상 작동 중',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    iconColor: 'text-green-600'
  },
  {
    value: 'inspection_needed',
    label: '점검필요',
    description: '점검이 필요함',
    icon: Info,
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    iconColor: 'text-yellow-600'
  },
  {
    value: 'part_replacement',
    label: '부품교체',
    description: '부품 교체 필요',
    icon: Settings,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    iconColor: 'text-orange-600'
  },
  {
    value: 'emergency_repair',
    label: '긴급수리',
    description: '즉시 수리 필요',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    iconColor: 'text-red-600'
  }
] as const

interface StatusSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showDescription?: boolean
}

export function StatusSelector({
  value = '',
  onValueChange,
  placeholder = "상태를 선택하세요",
  className = '',
  disabled = false,
  showDescription = true
}: StatusSelectorProps) {
  const [selectedType, setSelectedType] = useState<'preset' | 'custom'>('preset')
  const [customValue, setCustomValue] = useState('')

  // value가 기본 상태 중 하나인지 확인
  const isPresetStatus = DEFAULT_STATUSES.some(status => status.value === value)

  useEffect(() => {
    if (value) {
      if (isPresetStatus) {
        setSelectedType('preset')
      } else {
        setSelectedType('custom')
        setCustomValue(value)
      }
    }
  }, [value, isPresetStatus])

  const handlePresetChange = (newValue: string) => {
    if (newValue) {
      setSelectedType('preset')
      setCustomValue('')
      onValueChange(newValue)
    }
  }

  const handleCustomToggle = () => {
    if (selectedType === 'custom') {
      // 이미 커스텀 모드라면 첫 번째 기본 상태로 변경
      setSelectedType('preset')
      setCustomValue('')
      onValueChange(DEFAULT_STATUSES[0].value)
    } else {
      // 기본 상태에서 커스텀으로 변경
      setSelectedType('custom')
      setCustomValue(value && !isPresetStatus ? value : '')
      onValueChange(customValue || '')
    }
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setCustomValue(newValue)
    onValueChange(newValue)
  }

  const getSelectedStatus = () => {
    return DEFAULT_STATUSES.find(status => status.value === value)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 기본 상태 버튼들 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">자주 사용하는 상태</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEFAULT_STATUSES.map((status) => {
            const Icon = status.icon
            const isSelected = selectedType === 'preset' && value === status.value
            
            return (
              <button
                key={status.value}
                type="button"
                disabled={disabled}
                onClick={() => handlePresetChange(status.value)}
                className={`
                  relative flex flex-col items-center p-3 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                    : 'border-muted hover:border-primary/30'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                `}
              >
                <div className={`p-2 rounded-full mb-2 ${isSelected ? status.color : 'bg-muted'}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? status.iconColor : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <div className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {status.label}
                  </div>
                  {showDescription && (
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                      {status.description}
                    </div>
                  )}
                </div>
                
                {/* 선택 표시 */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 커스텀 입력 섹션 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">직접 입력</Label>
          <Badge 
            variant={selectedType === 'custom' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {selectedType === 'custom' ? '활성' : '비활성'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={handleCustomToggle}
            className={`
              flex items-center justify-center p-3 rounded-lg border-2 transition-all min-w-[60px]
              ${selectedType === 'custom' 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-muted hover:border-primary/30 bg-background'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
            `}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          
          <Input
            type="text"
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder={placeholder}
            disabled={disabled || selectedType !== 'custom'}
            className={`
              flex-1 transition-all
              ${selectedType === 'custom' 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'bg-muted'
              }
            `}
          />
        </div>
        
        {selectedType === 'custom' && (
          <p className="text-xs text-muted-foreground">
            특별한 상태나 세부 상황을 직접 입력하세요.
          </p>
        )}
      </div>

      {/* 현재 선택된 상태 표시 */}
      {value && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">선택된 상태:</div>
          {selectedType === 'preset' && getSelectedStatus() ? (
            <Badge className={getSelectedStatus()!.color}>
              <getSelectedStatus()!.icon className="h-3 w-3 mr-1" />
              {getSelectedStatus()!.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Edit3 className="h-3 w-3 mr-1" />
              {value}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// 유지보수 타입별 추천 상태
export const getRecommendedStatuses = (maintenanceType: string) => {
  const recommendations = {
    'preventive': ['normal', 'inspection_needed'],
    'corrective': ['part_replacement', 'normal'],
    'emergency': ['emergency_repair', 'part_replacement'],
    'inspection': ['normal', 'inspection_needed', 'part_replacement']
  }

  return recommendations[maintenanceType as keyof typeof recommendations] || []
}

// 상태 정보 유틸리티 함수
export const getStatusInfo = (status: string) => {
  return DEFAULT_STATUSES.find(s => s.value === status) || {
    value: status,
    label: status,
    description: '사용자 정의 상태',
    icon: Edit3,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  }
}