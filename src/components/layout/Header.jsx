// src/components/layout/Header.jsx
import { useSelector } from 'react-redux'
import { BellIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your properties today.
            </p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header