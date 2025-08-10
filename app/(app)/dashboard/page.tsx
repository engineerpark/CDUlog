// 실외기케어 대시보드 - 메인 대시보드 페이지
import { createServerClient, getCurrentUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container, ResponsiveGrid, ResponsiveShow } from '@/components/layout/responsive-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Users,
  Wrench,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Settings
} from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = createServerClient()

  // 대시보드 통계 데이터 조회
  const [
    unitsResult,
    maintenanceLogsResult,
    recentMaintenanceResult,
    upcomingMaintenanceResult
  ] = await Promise.allSettled([
    supabase.from('units').select('id, name, status, location'),
    supabase
      .from('maintenance_logs')
      .select('id, status, maintenance_type, actual_cost')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('maintenance_logs')
      .select(`
        id, title, status, created_at, maintenance_type,
        units(name, location),
        profiles!user_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('maintenance_logs')
      .select(`
        id, title, scheduled_date, maintenance_type,
        units(name, location)
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(5)
  ])

  // 통계 계산
  const units = unitsResult.status === 'fulfilled' ? unitsResult.value.data || [] : []
  const maintenanceLogs = maintenanceLogsResult.status === 'fulfilled' ? maintenanceLogsResult.value.data || [] : []
  const recentMaintenance = recentMaintenanceResult.status === 'fulfilled' ? recentMaintenanceResult.value.data || [] : []
  const upcomingMaintenance = upcomingMaintenanceResult.status === 'fulfilled' ? upcomingMaintenanceResult.value.data || [] : []

  const stats = {
    totalUnits: units.length,
    activeUnits: units.filter(u => u.status === 'active').length,
    maintenanceUnits: units.filter(u => u.status === 'maintenance').length,
    totalMaintenanceThisMonth: maintenanceLogs.length,
    completedMaintenance: maintenanceLogs.filter(m => m.status === 'completed').length,
    pendingMaintenance: maintenanceLogs.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length,
    totalCostThisMonth: maintenanceLogs
      .filter(m => m.actual_cost)
      .reduce((sum, m) => sum + (m.actual_cost || 0), 0)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      scheduled: 'outline',
      in_progress: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      on_hold: 'secondary'
    }
    
    const labels: Record<string, string> = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소',
      on_hold: '대기'
    }

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preventive: '예방정비',
      corrective: '수정정비',
      emergency: '응급정비',
      inspection: '점검'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            대시보드
          </h1>
          <p className="text-gray-600">
            안녕하세요, {user.profile?.full_name || user.email}님! 
            ({user.profile?.role === 'admin' ? '관리자' : 
              user.profile?.role === 'manager' ? '매니저' :
              user.profile?.role === 'technician' ? '기술자' : '뷰어'})
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          설정
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 실외기</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              활성: {stats.activeUnits}대
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 유지보수</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaintenanceThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              완료: {stats.completedMaintenance}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">유지보수 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              {stats.maintenanceUnits > 0 && (
                <>정비 중: {stats.maintenanceUnits}대</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 비용</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCostThisMonth.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              평균: {Math.round(stats.totalCostThisMonth / Math.max(stats.completedMaintenance, 1)).toLocaleString()}원
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 유지보수 이력 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              최근 유지보수 이력
            </CardTitle>
            <CardDescription>
              최근 5건의 유지보수 기록입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.length > 0 ? (
                recentMaintenance.map((maintenance: any) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{maintenance.title}</h4>
                      <p className="text-xs text-gray-600">
                        {maintenance.units?.name} - {maintenance.units?.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        {maintenance.profiles?.full_name || '담당자 미지정'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(maintenance.status)}
                      <p className="text-xs text-gray-500">
                        {getMaintenanceTypeLabel(maintenance.maintenance_type)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  최근 유지보수 이력이 없습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 예정된 유지보수 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              예정된 유지보수
            </CardTitle>
            <CardDescription>
              가까운 시일 내 예정된 유지보수 작업입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMaintenance.length > 0 ? (
                upcomingMaintenance.map((maintenance: any) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{maintenance.title}</h4>
                      <p className="text-xs text-gray-600">
                        {maintenance.units?.name} - {maintenance.units?.location}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium text-yellow-800">
                        {new Date(maintenance.scheduled_date).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getMaintenanceTypeLabel(maintenance.maintenance_type)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  예정된 유지보수가 없습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 기능들에 바로 접근할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-xs">실외기 관리</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Wrench className="h-6 w-6" />
              <span className="text-xs">유지보수 등록</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs">통계 보고서</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-xs">사용자 관리</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 시스템 알림 */}
      {stats.maintenanceUnits > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            현재 {stats.maintenanceUnits}대의 실외기가 유지보수 중입니다. 
            작업 상황을 확인해주세요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}