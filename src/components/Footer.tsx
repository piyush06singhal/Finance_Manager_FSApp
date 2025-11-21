import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-grey-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold">Finance Manager</span>
            </div>
            <p className="text-grey-300 text-sm">
              Manage your budgets, savings, and transactions efficiently with confidence and clarity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/budgets" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Budgets
                </Link>
              </li>
              <li>
                <Link href="/pots" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Savings
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Transactions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-grey-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://x.com/PiyushS07508112"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-grey-500 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/piyush--singhal/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-grey-500 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/piyush06singhal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-grey-500 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:piyush.singhal.2004@gmail.com"
                className="w-10 h-10 bg-grey-500 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-grey-500 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-grey-300 text-sm">
              © {currentYear} Finance Manager. All rights reserved.
            </p>
            <p className="text-grey-300 text-sm">
              Made with ❤️ for better financial management
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
