// 실외기케어 대시보드 - 반응형 유지보수 목록 컴포넌트
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ResponsiveShow, ResponsiveGrid, Container } from "@/components/layout/responsive-layout"
import { MaintenanceStatusButton } from "@/components/maintenance/status-button"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { DeleteMaintenanceButton } from "@/components/maintenance/delete-button"
import {
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  User,
  AlertTriangle,
  CheckCircle2,
  Settings,
  FileText
} from "lucide-react"

interface MaintenanceItem {
  id: string
  title: string
  description?: string
  unit_id: string
  units: {
    id: string
    name: string
    location: string
    status: string
  }
  profiles: {
    full_name: string
    role: string
  }
  maintenance_type: string
  status: string
  priority: string
  scheduled_date: string
  estimated_cost?: number
  actual_cost?: number
  user_id: string
  created_at: string
}

interface Unit {
  id: string
  name: string
  location: string
  status: string
}

interface MaintenanceListProps {
  maintenanceLogs: MaintenanceItem[]
  units: Unit[]
  currentUser: any
  searchParams?: {
    status?: string
    unit?: string
    type?: string
    search?: string
  }
}

export function MaintenanceList({ 
  maintenanceLogs, 
  units, 
  currentUser,
  searchParams = {}
}: MaintenanceListProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')

  // 필터링된 데이터
  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.units.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.units.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: 'outline' as const, label: '예정', icon: Calendar },
      in_progress: { variant: 'default' as const, label: '진행중', icon: Clock },
      completed: { variant: 'secondary' as const, label: '완료', icon: CheckCircle2 },
      cancelled: { variant: 'destructive' as const, label: '취소', icon: AlertTriangle },
      on_hold: { variant: 'secondary' as const, label: '대기', icon: Clock }
    }
    
    const config = variants[status as keyof typeof variants] || variants.scheduled
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMaintenanceTypeLabel = (type: string) => {
    const labels = {
      preventive: '예방정비',
      corrective: '수정정비', 
      emergency: '응급정비',
      inspection: '점검'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800', 
      urgent: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      urgent: '긴급'
    }
    
    return (
      <Badge className={variants[priority as keyof typeof variants] || variants.medium}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const canCreateMaintenance = ['technician', 'manager', 'admin'].includes(currentUser?.profile?.role || '')
  const canEditMaintenance = ['manager', 'admin'].includes(currentUser?.profile?.role || '')

  // 모바일 카드 뷰 컴포넌트
  const MobileCard = ({ maintenance }: { maintenance: MaintenanceItem }) => {
    const isOverdue = maintenance.status === 'scheduled' && 
                     maintenance.scheduled_date && 
                     new Date(maintenance.scheduled_date) < new Date()

    return (
      <Card className={`${isOverdue ? 'border-red-200 bg-red-50' : ''} hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight mb-1">
                {maintenance.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{maintenance.units.name} - {maintenance.units.location}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>작업</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {(canEditMaintenance || maintenance.user_id === currentUser?.id) && (
                  <MaintenanceForm
                    units={units}
                    maintenance={maintenance as any}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        수정
                      </DropdownMenuItem>
                    }
                  />
                )}
                
                {(canEditMaintenance || maintenance.user_id === currentUser?.id) && (
                  <>
                    <DropdownMenuSeparator />
                    <DeleteMaintenanceButton
                      maintenanceId={maintenance.id}
                      maintenanceTitle={maintenance.title}
                    />
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* 상태 및 우선순위 */}
          <div className="flex items-center justify-between">
            <MaintenanceStatusButton
              maintenanceId={maintenance.id}
              currentStatus={maintenance.status as any}
            />
            {getPriorityBadge(maintenance.priority)}
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <span>{getMaintenanceTypeLabel(maintenance.maintenance_type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{maintenance.profiles.full_name}</span>
            </div>
          </div>

          {/* 일정 및 비용 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{formatDate(maintenance.scheduled_date)}</span>
              {isOverdue && <Badge variant="destructive" className="text-xs">지연</Badge>}
            </div>
            {(maintenance.estimated_cost || maintenance.actual_cost) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-2 text-xs">
                  <span>예상: {formatCurrency(maintenance.estimated_cost)}</span>
                  {maintenance.actual_cost && (
                    <span className="font-medium">실제: {formatCurrency(maintenance.actual_cost)}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 설명 */}
          {maintenance.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {maintenance.description}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Container>
      <div className="space-y-4 sm:space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">유지보수 이력</h1>
            <p className="text-sm sm:text-base text-gray-600">실외기 유지보수 작업을 관리하고 추적하세요</p>
          </div>
          {canCreateMaintenance && (
            <MaintenanceForm 
              units={units}
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  유지보수 등록
                </Button>
              }
            />
          )}
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="제목, 실외기명, 위치 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <ResponsiveShow above="sm">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    카드
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    테이블
                  </Button>
                </div>
              </ResponsiveShow>
            </div>
          </CardContent>
        </Card>

        {/* 모바일 카드 목록 */}
        <ResponsiveShow only="mobile">
          {filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((maintenance) => (
                <MobileCard key={maintenance.id} maintenance={maintenance} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  유지보수 이력이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  첫 번째 유지보수 작업을 등록해보세요.
                </p>
                {canCreateMaintenance && (
                  <MaintenanceForm 
                    units={units}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        유지보수 등록
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </ResponsiveShow>

        {/* 데스크톱 테이블 */}
        <ResponsiveShow above="sm">
          <Card>
            <CardHeader>
              <CardTitle>유지보수 이력</CardTitle>
              <div className="text-sm text-muted-foreground">
                총 {filteredLogs.length}건의 기록
              </div>
            </CardHeader>
            <CardContent>
              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>실외기</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>우선순위</TableHead>
                        <TableHead>담당자</TableHead>
                        <TableHead>예정일</TableHead>
                        <TableHead>비용</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((maintenance) => {
                        const isOverdue = maintenance.status === 'scheduled' && 
                                         maintenance.scheduled_date && 
                                         new Date(maintenance.scheduled_date) < new Date()
                        
                        return (
                          <TableRow key={maintenance.id} className={isOverdue ? 'bg-red-50' : ''}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{maintenance.title}</div>
                                {maintenance.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {maintenance.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div>
                                  <div className="font-medium">{maintenance.units.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {maintenance.units.location}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getMaintenanceTypeLabel(maintenance.maintenance_type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <MaintenanceStatusButton
                                maintenanceId={maintenance.id}
                                currentStatus={maintenance.status as any}
                              />
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(maintenance.priority)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {maintenance.profiles.full_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(maintenance.scheduled_date)}
                                {isOverdue && (
                                  <div className="text-red-600 font-medium">지연</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>예상: {formatCurrency(maintenance.estimated_cost)}</div>
                                {maintenance.actual_cost && (
                                  <div className="font-medium">
                                    실제: {formatCurrency(maintenance.actual_cost)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>작업</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {(canEditMaintenance || maintenance.user_id === currentUser?.id) && (
                                    <MaintenanceForm
                                      units={units}
                                      maintenance={maintenance as any}
                                      trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          수정
                                        </DropdownMenuItem>
                                      }
                                    />
                                  )}
                                  
                                  {(canEditMaintenance || maintenance.user_id === currentUser?.id) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DeleteMaintenanceButton
                                        maintenanceId={maintenance.id}
                                        maintenanceTitle={maintenance.title}
                                      />
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    유지보수 이력이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    첫 번째 유지보수 작업을 등록해보세요.
                  </p>
                  {canCreateMaintenance && (
                    <MaintenanceForm 
                      units={units}
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          유지보수 등록
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </ResponsiveShow>
      </div>
    </Container>
  )
}