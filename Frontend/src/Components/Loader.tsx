import { LoaderIcon } from 'lucide-react'
import { useThemeStore } from '../store/useThemeStore.ts'

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div className="flex items-center justify-center min-h-screen" data-theme={theme}>
        <LoaderIcon className="animate-spin size-10 text-primary"></LoaderIcon>
    </div>
  )
}

export default PageLoader