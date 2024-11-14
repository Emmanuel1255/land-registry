import React, { useState, useEffect } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Switch } from '@/components/common/Switch'

const Settings = () => {
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null)
    const { user: authUser } = useSelector((state) => state.auth)

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5004/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch profile')
            }

            const data = await response.json()
            console.log("User",data);
            setUserData(data.user)
        } catch (error) {
            toast.error('Error fetching profile data')
            console.error('Profile fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const personalInfoSchema = Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        phoneNumber: Yup.string(),
        address: Yup.object({
            street: Yup.string(),
            city: Yup.string(),
            state: Yup.string(),
        })
    })

    const passwordSchema = Yup.object({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('New password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Please confirm your password'),
    })

    const handleUpdateProfile = async (values, { setSubmitting }) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5004/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const data = await response.json()
            console.log("User",data);
            setUserData(data)
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error('Error updating profile')
            console.error('Profile update error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5004/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword // Added this line
                }),
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }
    
            toast.success('Password updated successfully');
            resetForm();
        } catch (error) {
            toast.error(error.message || 'Error changing password');
        } finally {
            setSubmitting(false);
        }
    };
    

    const handleNotificationSettings = async (values, { setSubmitting }) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5004/api/auth/notifications/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notifications: values.notifications,
                    newsletter: values.newsletter
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update notification settings')
            }

            toast.success('Notification settings updated successfully')
        } catch (error) {
            toast.error('Error updating notification settings')
            console.error('Notification settings error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-8">
                <Card>
                    <div className="p-6 text-center">Loading...</div>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto mt-8 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* Personal Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <Formik
                        initialValues={{
                            firstName: userData?.firstName || '',
                            lastName: userData?.lastName || '',
                            email: userData?.email || '',
                            phoneNumber: userData?.phoneNumber || '',
                            address: userData?.address || {
                                street: '',
                                city: '',
                                state: ''
                            }
                        }}
                        validationSchema={personalInfoSchema}
                        onSubmit={handleUpdateProfile}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        name="firstName"
                                        type="text"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.firstName}
                                        error={touched.firstName && errors.firstName}
                                    />
                                    <Input
                                        label="Last Name"
                                        name="lastName"
                                        type="text"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.lastName}
                                        error={touched.lastName && errors.lastName}
                                    />
                                </div>

                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                    error={touched.email && errors.email}
                                />

                                <Input
                                    label="Phone Number"
                                    name="phoneNumber"
                                    type="text"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.phoneNumber}
                                    error={touched.phoneNumber && errors.phoneNumber}
                                />

                                <div className="mt-4">
                                    <Input
                                        label="Street Address"
                                        name="address.street"
                                        type="text"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.address.street}
                                        error={touched.address?.street && errors.address?.street}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="City"
                                            name="address.city"
                                            type="text"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.address.city}
                                            error={touched.address?.city && errors.address?.city}
                                        />
                                        <Input
                                            label="State/Province"
                                            name="address.state"
                                            type="text"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.address.state}
                                            error={touched.address?.state && errors.address?.state}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button type="submit" loading={isSubmitting}>
                                        Save Personal Info
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Card>

            {/* Change Password */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                    <Formik
                        initialValues={{
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                        }}
                        validationSchema={passwordSchema}
                        onSubmit={handlePasswordChange}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form>
                                <Input
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.currentPassword}
                                    error={touched.currentPassword && errors.currentPassword}
                                />

                                <Input
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.newPassword}
                                    error={touched.newPassword && errors.newPassword}
                                />

                                <Input
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.confirmPassword}
                                    error={touched.confirmPassword && errors.confirmPassword}
                                />

                                <div className="mt-6">
                                    <Button type="submit" loading={isSubmitting}>
                                        Update Password
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Card>

            {/* Notifications */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
                    <Formik
                        initialValues={{
                            notifications: userData?.notifications || false,
                            newsletter: userData?.newsletter || false,
                        }}
                        onSubmit={handleNotificationSettings}
                    >
                        {({ values, handleChange, isSubmitting }) => (
                            <Form>
                                <div className="flex items-center justify-between py-2">
                                    <label className="text-gray-700 font-medium">Enable Notifications</label>
                                    <Switch
                                        name="notifications"
                                        checked={values.notifications}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <label className="text-gray-700 font-medium">Subscribe to Newsletter</label>
                                    <Switch
                                        name="newsletter"
                                        checked={values.newsletter}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mt-6">
                                    <Button type="submit" loading={isSubmitting}>
                                        Save Notification Settings
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Card>
        </div>
    )
}

export default Settings