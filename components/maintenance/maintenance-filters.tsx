// 실외기케어 대시보드 - 유지보수 검색/필터링 컴포넌트
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  priorityLabels
} from "@/lib/validations/maintenance"
import {
  Search,
  Filter,
  X,
  Calendar,
  ChevronDown,
  RotateCcw,
  MapPin,
  Settings,
  AlertTriangle
} from "lucide-react"

interface Unit {
  id: string
  name: string
  location: string
  status: string
}

interface MaintenanceFiltersProps {
  units: Unit[]
  className?: string
}

export function MaintenanceFilters({ units, className = "" }: MaintenanceFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 현재 URL 파라미터에서 초기값 가져오기
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    unit_id: searchParams.get('unit') || '',
    maintenance_type: searchParams.get('type') || '',
    priority: searchParams.get('priority') || '',
    technician: searchParams.get('technician') || '',
    date_from: searchParams.get('date_from') ? new Date(searchParams.get('date_from')!) : undefined,
    date_to: searchParams.get('date_to') ? new Date(searchParams.get('date_to')!) : undefined,
  })

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.search)

  // URL 업데이트 함수
  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (value instanceof Date) {
          params.set(key, value.toISOString().split('T')[0])
        } else {
          params.set(key, value.toString())
        }
      }
    })

    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  // 필터 적용
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      unit_id: '',
      maintenance_type: '',
      priority: '',
      technician: '',
      date_from: undefined,
      date_to: undefined,
    }
    setFilters(emptyFilters)
    setSearchTerm('')
    updateURL(emptyFilters)
  }

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        applyFilters({ search: searchTerm })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 활성 필터 개수 계산
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false // 검색은 별도 카운트
    return value !== '' && value !== undefined
  }).length

  // 활성 필터 배지 생성
  const getActiveFilterBadges = () => {
    const badges = []

    if (filters.status) {
      badges.push({
        key: 'status',
        label: `상태: ${maintenanceStatusLabels[filters.status as keyof typeof maintenanceStatusLabels]}`,
        onRemove: () => applyFilters({ status: '' })
      })
    }

    if (filters.unit_id) {
      const unit = units.find(u => u.id === filters.unit_id)
      badges.push({
        key: 'unit',
        label: `실외기: ${unit?.name || '알 수 없음'}`,
        onRemove: () => applyFilters({ unit_id: '' })
      })
    }

    if (filters.maintenance_type) {
      badges.push({
        key: 'type',
        label: `유형: ${maintenanceTypeLabels[filters.maintenance_type as keyof typeof maintenanceTypeLabels]}`,
        onRemove: () => applyFilters({ maintenance_type: '' })
      })
    }

    if (filters.priority) {
      badges.push({
        key: 'priority',
        label: `우선순위: ${priorityLabels[filters.priority as keyof typeof priorityLabels]}`,
        onRemove: () => applyFilters({ priority: '' })
      })
    }

    if (filters.date_from || filters.date_to) {
      const fromStr = filters.date_from?.toLocaleDateString('ko-KR')
      const toStr = filters.date_to?.toLocaleDateString('ko-KR')
      let dateLabel = '기간: '
      
      if (filters.date_from && filters.date_to) {
        dateLabel += `${fromStr} ~ ${toStr}`
      } else if (filters.date_from) {
        dateLabel += `${fromStr} 이후`
      } else if (filters.date_to) {
        dateLabel += `${toStr} 이전`
      }

      badges.push({
        key: 'date',
        label: dateLabel,
        onRemove: () => applyFilters({ date_from: undefined, date_to: undefined })
      })
    }

    return badges
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* 검색 바 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목, 실외기명, 위치, 담당자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                상세 필터
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {(activeFilterCount > 0 || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  초기화
                </Button>
              )}
            </div>
          </div>

          {/* 활성 필터 배지 */}
          {getActiveFilterBadges().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getActiveFilterBadges().map((badge) => (
                <Badge
                  key={badge.key}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {badge.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={badge.onRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* 상세 필터 */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className="space-y-4">
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 상태 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    상태
                  </Label>
                  <Select value={filters.status} onValueChange={(value) => applyFilters({ status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 상태</SelectItem>
                      {Object.entries(maintenanceStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 실외기 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    실외기
                  </Label>
                  <Select value={filters.unit_id} onValueChange={(value) => applyFilters({ unit_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 실외기" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 실외기</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} - {unit.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 유형 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    유지보수 유형
                  </Label>
                  <Select value={filters.maintenance_type} onValueChange={(value) => applyFilters({ maintenance_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 유형</SelectItem>
                      {Object.entries(maintenanceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 우선순위 필터 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    우선순위
                  </Label>
                  <Select value={filters.priority} onValueChange={(value) => applyFilters({ priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 우선순위" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 우선순위</SelectItem>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 날짜 범위 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  예정일 범위
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">시작일</Label>
                    <DatePicker
                      date={filters.date_from}
                      onDateChange={(date) => applyFilters({ date_from: date })}
                      placeholder="시작일 선택"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">종료일</Label>
                    <DatePicker
                      date={filters.date_to}
                      onDateChange={(date) => applyFilters({ date_to: date })}
                      placeholder="종료일 선택"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}

// Collapsible 컴포넌트가 필요하므로 임시로 간단한 버전을 만들겠습니다
interface CollapsibleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Collapsible({ open, onOpenChange, children }: CollapsibleProps) {
  return <div>{children}</div>
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
}

function CollapsibleTrigger({ children }: CollapsibleTriggerProps) {
  return <>{children}</>
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

function CollapsibleContent({ children, className = '' }: CollapsibleContentProps) {
  return <div className={className}>{children}</div>
}