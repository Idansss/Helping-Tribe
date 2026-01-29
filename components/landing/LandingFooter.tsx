'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react'
import { NewsletterSubscription } from './NewsletterSubscription'

export function LandingFooter() {
  return (
    <footer className="bg-[#4c1d95] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-xl font-bold">HT</span>
              </div>
              <span className="text-xl font-bold">THE HELPING TRIBE</span>
            </div>
            <p className="text-sm text-white/80">
              The Helping Tribe is more than a school—it&apos;s a movement. A
              community that uplifts you and equips you to build a fulfilling
              counseling practice.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#program"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Program Overview
                </Link>
              </li>
              <li>
                <Link
                  href="#curriculum"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Curriculum
                </Link>
              </li>
              <li>
                <Link
                  href="#faculty"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Faculty
                </Link>
              </li>
              <li>
                <Link
                  href="#enrollment"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Enrollment
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Resource Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Quick Reference Tools
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <NewsletterSubscription />

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:helpingtribe@blakmoh.com"
                  className="hover:text-white transition-colors"
                >
                  helpingtribe@blakmoh.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="h-4 w-4" />
                <a
                  href="tel:+2347030052021"
                  className="hover:text-white transition-colors"
                >
                  +234 703 0052 021
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="https://facebook.com/helpingtribe"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/helpingtribe"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/helpingtribe"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Helping Tribe. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-sm items-center">
              <a
                href="https://forms.gle/KwDLsxydSBo51ng8A"
                target="_blank"
                rel="noreferrer noopener"
                className="px-4 py-2 rounded-full bg-white text-[#4c1d95] text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
              Join the Tribe Today
            </a>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-white/80 hover:text-white transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
