// 실외기케어 대시보드 - 유지보수 이력 관리 페이지
import { createServerClient, getCurrentUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MaintenanceForm } from '@/components/maintenance/maintenance-form'
import { MaintenanceStatusButton } from '@/components/maintenance/status-button'
import { DeleteMaintenanceButton } from '@/components/maintenance/delete-button'
import {
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause
} from 'lucide-react'

interface SearchParams {
  status?: string
  unit?: string
  type?: string
}

export default async function MaintenancePage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = createServerClient()

  // 필터 파라미터 처리
  const statusFilter = searchParams.status
  const unitFilter = searchParams.unit
  const typeFilter = searchParams.type

  // 유지보수 이력 조회 (필터 적용)
  let maintenanceQuery = supabase
    .from('maintenance_logs')
    .select(`
      *,
      units(id, name, location, status),
      profiles!user_id(full_name, role)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    maintenanceQuery = maintenanceQuery.eq('status', statusFilter)
  }
  if (unitFilter) {
    maintenanceQuery = maintenanceQuery.eq('unit_id', unitFilter)
  }
  if (typeFilter) {
    maintenanceQuery = maintenanceQuery.eq('maintenance_type', typeFilter)
  }

  // 실외기 목록 조회 (폼에서 사용)
  const [maintenanceResult, unitsResult] = await Promise.allSettled([
    maintenanceQuery,
    supabase
      .from('units')
      .select('id, name, location, status')
      .eq('status', 'active')
      .order('name')
  ])

  const maintenanceLogs = maintenanceResult.status === 'fulfilled' ? maintenanceResult.value.data || [] : []
  const units = unitsResult.status === 'fulfilled' ? unitsResult.value.data || [] : []

  // 통계 계산
  const stats = {
    total: maintenanceLogs.length,
    scheduled: maintenanceLogs.filter(m => m.status === 'scheduled').length,
    inProgress: maintenanceLogs.filter(m => m.status === 'in_progress').length,
    completed: maintenanceLogs.filter(m => m.status === 'completed').length,
    overdue: maintenanceLogs.filter(m => 
      m.status === 'scheduled' && 
      m.scheduled_date && 
      new Date(m.scheduled_date) < new Date()
    ).length
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: 'outline' as const, label: '예정', icon: Calendar },
      in_progress: { variant: 'default' as const, label: '진행중', icon: Clock },
      completed: { variant: 'secondary' as const, label: '완료', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: '취소', icon: AlertCircle },
      on_hold: { variant: 'secondary' as const, label: '대기', icon: Pause }
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

  const getMaintenanceTypeBadge = (type: string) => {
    const variants = {
      preventive: 'default',
      corrective: 'secondary',
      emergency: 'destructive',
      inspection: 'outline'
    } as const
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {getMaintenanceTypeLabel(type)}
      </Badge>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 사용자 권한 확인
  const canCreateMaintenance = ['technician', 'manager', 'admin'].includes(user.profile?.role || '')
  const canEditMaintenance = ['manager', 'admin'].includes(user.profile?.role || '')

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">유지보수 이력</h1>
          <p className="text-gray-600">실외기 유지보수 작업을 관리하고 추적하세요</p>
        </div>
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">전체</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">예정</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">진행중</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">완료</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">지연</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 지연된 작업 알림 */}
      {stats.overdue > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.overdue}개의 유지보수 작업이 예정일을 지났습니다. 상태를 확인해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 유지보수 이력 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>유지보수 이력</CardTitle>
          <CardDescription>
            {statusFilter && `상태: ${statusFilter} | `}
            {typeFilter && `유형: ${getMaintenanceTypeLabel(typeFilter)} | `}
            총 {maintenanceLogs.length}건의 기록
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maintenanceLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>실외기</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>예정일</TableHead>
                  <TableHead>비용</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceLogs.map((maintenance: any) => {
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
                            <div className="font-medium">{maintenance.units?.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {maintenance.units?.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMaintenanceTypeBadge(maintenance.maintenance_type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(maintenance.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {maintenance.profiles?.full_name || '미지정'}
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
                            
                            {/* 상태 변경 */}
                            <MaintenanceStatusButton
                              maintenanceId={maintenance.id}
                              currentStatus={maintenance.status}
                            />
                            
                            {/* 수정 */}
                            {(canEditMaintenance || maintenance.user_id === user.id) && (
                              <MaintenanceForm
                                units={units}
                                maintenance={maintenance}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    수정
                                  </DropdownMenuItem>
                                }
                              />
                            )}
                            
                            {/* 삭제 */}
                            {(canEditMaintenance || maintenance.user_id === user.id) && (
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
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
    </div>
  )
}