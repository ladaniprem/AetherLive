"use client";

import { SignUp, useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Page = () => {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) {
    return null
  }

  return (
    <SignUp routing="hash" />
  )
}

export default Page