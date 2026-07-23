export const usesOpenDesktopNav = (pathname: string) =>
  pathname === '/help' || pathname === '/learn' || pathname.startsWith('/learn/')
