'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Faculty, Module } from '@/types'

export function PublicLanding() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Load faculty
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('*')
          .order('display_order', { ascending: true })

        if (facultyError) {
          console.error('Error loading faculty:', facultyError)
        } else if (facultyData) {
          setFaculty(facultyData as Faculty[])
        }

        // Load modules for preview
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('week_number', { ascending: true })
          .limit(9)

        if (modulesError) {
          console.error('Error loading modules:', modulesError)
        } else if (modulesData) {
          setModules(modulesData as Module[])
        }
      } catch (error) {
        console.error('Error loading landing page data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Equipping the Hands That Help
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive 9-week course on counseling, ethics, and trauma support
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#curriculum">View Curriculum</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      {faculty.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Our Faculty</h2>
              <p className="text-muted-foreground">
                Learn from experienced mentors and counselors
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    {member.avatar_url && (
                      <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="text-center">{member.name}</CardTitle>
                    {member.title && (
                      <CardDescription className="text-center">
                        {member.title}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {member.bio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center">
                        {member.bio}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curriculum Preview */}
      <section id="curriculum" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">9-Week Curriculum</h2>
            <p className="text-muted-foreground">
              A structured journey through foundational helping skills
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card key={module.id} className="relative">
                  <div className="flex items-start gap-4 p-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {module.week_number}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{module.title}</CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant="outline">Week {module.week_number}</Badge>
                  </div>
                  {index < modules.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Structured Learning</CardTitle>
                <CardDescription>
                  Sequential modules that build upon each other
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Connect with peers and mentors throughout your journey
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Certification</CardTitle>
                <CardDescription>
                  Earn your certificate upon successful completion
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your journey in foundational helping skills today
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              Enroll Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
