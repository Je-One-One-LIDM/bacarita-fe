import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type Role = 'students' | 'parents' | 'teachers'

const AUTH_PATH: Record<Role, string> = {
  students: '/siswa/login',
  parents: '/orang-tua/login',
  teachers: '/guru/login',
}

const HOME_PATH: Record<Role, string> = {
  students: '/siswa/beranda',
  parents: '/orang-tua/beranda',
  teachers: '/guru/beranda',
}

const PROTECTED_PREFIX = ['/siswa', '/orang-tua', '/guru']

function requiredRoleForPath(path: string): Role | null {
  if (path.startsWith('/siswa')) return 'students'
  if (path.startsWith('/orang-tua')) return 'parents'
  if (path.startsWith('/guru')) return 'teachers'
  return null
}

function isAnyLoginPath(path: string) {
  return path === AUTH_PATH.students || path === AUTH_PATH.parents || path === AUTH_PATH.teachers
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value
  const role = req.cookies.get('role')?.value as Role | undefined
  const required = requiredRoleForPath(pathname)

  if (!PROTECTED_PREFIX.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (token && role && pathname === AUTH_PATH[role]) {
    return NextResponse.redirect(new URL(HOME_PATH[role], req.url))
  }

  if (isAnyLoginPath(pathname)) {
    return NextResponse.next()
  }

  if (!token || !required) {
    const to = required ? AUTH_PATH[required] : '/'
    return NextResponse.redirect(new URL(to, req.url))
  }

  if (role && role !== required) {
    return NextResponse.redirect(new URL(HOME_PATH[role], req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/siswa/:path*', '/orang-tua/:path*', '/guru/:path*'],
}
