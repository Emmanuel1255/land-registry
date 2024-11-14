import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const Profile = () => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user: authUser } = useSelector((state) => state.auth)

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate('/login')
                return
            }

            const response = await fetch('https://land-registry-backend.onrender.com/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch profile')
            }

            const data = await response.json()
            console.log(data);
            setUserData(data.user)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-8">
                <Card>
                    <div className="p-6 text-center">
                        Loading...
                    </div>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto mt-8">
                <Card>
                    <div className="p-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => fetchUserProfile()}
                        >
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Format join date
    const joinDate = userData?.createdAt 
        ? new Date(userData.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
        : 'N/A'

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <Card>
                <div className="p-6">
                    <div className="flex items-center space-x-6">
                        <img
                            src={userData?.profilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                            onError={(e) => {
                                e.target.src = "/api/placeholder/150/150"
                            }}
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {userData?.firstName} {userData?.lastName}
                            </h1>
                            <p className="text-sm text-gray-500">Joined: {joinDate}</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center">
                            <p className="text-gray-600 font-medium w-28">Email:</p>
                            <p className="text-gray-900">{userData?.email}</p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-gray-600 font-medium w-28">Phone:</p>
                            <p className="text-gray-900">{userData?.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-gray-600 font-medium w-28">Address:</p>
                            <p className="text-gray-900">
                                {userData?.address ? (
                                    `${userData.address.street}, ${userData.address.city}, ${userData.address.state}`
                                ) : (
                                    'Not provided'
                                )}
                            </p>
                        </div>
                        <div className="flex items-start">
                            <p className="text-gray-600 font-medium w-28">Role:</p>
                            <p className="text-gray-900 capitalize">{userData?.role || 'User'}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <Button 
                            variant="outline"
                            onClick={() => navigate('/settings')}
                        >
                            Edit Profile
                        </Button>
                        {/* <Button onClick={() => navigate('/settings')}>
                            Settings
                        </Button> */}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Profile