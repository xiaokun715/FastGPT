import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useToast } from '@fastgpt/web/hooks/useToast';

const unAuthPage: { [key: string]: boolean } = {
  '/': true,
  '/login': true,
  '/login/provider': true,
  '/login/fastlogin': true,
  '/login/sso': true,
  '/appStore': true,
  '/chat/share': true,
  '/chat/team': true,
  '/tools/price': true,
  '/price': true
};

// 检测是否在iframe中
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

const Auth = ({ children }: { children: JSX.Element | React.ReactNode }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { userInfo, initUserInfo } = useUserStore();
  const inIframe = isInIframe();

  useQuery(
    [router.pathname],
    () => {
      if (unAuthPage[router.pathname] === true || userInfo) {
        return null;
      } else {
        return initUserInfo();
      }
    },
    {
      onError(error) {
        console.log('error->', error);
        // 在iframe中不自动跳转到登录页
        if (!inIframe) {
          router.replace(
            `/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`
          );
          toast({
            status: 'warning',
            title: t('common:support.user.Need to login')
          });
        }
      }
    }
  );

  // 在iframe中，如果没有用户信息，直接显示内容（允许匿名访问）
  if (inIframe && !userInfo && !unAuthPage[router.pathname]) {
    return children;
  }

  return !!userInfo || unAuthPage[router.pathname] === true ? children : null;
};

export default Auth;
