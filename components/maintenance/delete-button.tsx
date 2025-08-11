// 실외기케어 대시보드 - 유지보수 이력 삭제 버튼 컴포넌트
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DeleteMaintenanceButtonProps {
  maintenanceId: string
  title?: string
  onSuccess?: () => void
}

export function DeleteMaintenanceButton({
  maintenanceId,
  title,
  onSuccess
}: DeleteMaintenanceButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!maintenanceId) return

    setIsDeleting(true)
    
    try {
      const supabase = createClient()
      
      // 유지보수 이력 삭제
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('id', maintenanceId)

      if (error) {
        console.error('삭제 중 오류 발생:', error)
        alert('삭제 중 오류가 발생했습니다: ' + error.message)
        return
      }

      // 성공적으로 삭제됨
      setIsOpen(false)
      
      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess()
      } else {
        // 기본 동작: 페이지 새로고침
        router.refresh()
      }
      
    } catch (error) {
      console.error('삭제 중 예상치 못한 오류:', error)
      alert('삭제 중 예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-1">삭제</span>
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>유지보수 이력 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            {title ? (
              <>
                <strong>"{title}"</strong> 유지보수 이력을 정말 삭제하시겠습니까?
              </>
            ) : (
              '이 유지보수 이력을 정말 삭제하시겠습니까?'
            )}
            <br />
            <br />
            <span className="text-destructive font-medium">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}