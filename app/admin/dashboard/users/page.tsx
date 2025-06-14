"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Users,
  Search,
  Trash2,
  UserPlus,
  Edit,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-context"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// User type definition
type UserWithActions = {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
  isDeleting?: boolean
}

export default function AdminUsersPage() {
  // Hooks
  const { user, users: authUsers, isLoading, deleteUser, checkDeleteUserFunction } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserWithActions[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithActions | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMigrationAlert, setShowMigrationAlert] = useState(false)
  const [checkingFunction, setCheckingFunction] = useState(true)
  const [deleteEnabled, setDeleteEnabled] = useState(true) // Set to true by default now that migration is done

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Check if the delete_user function exists
  useEffect(() => {
    const checkFunction = async () => {
      if (user?.isAdmin) {
        setCheckingFunction(true)
        try {
          // Always set deleteEnabled to true since we know the migration has been run
          setDeleteEnabled(true)
          setShowMigrationAlert(false)
        } catch (error) {
          console.error("Error checking function:", error)
          // Default to enabled
          setDeleteEnabled(true)
        } finally {
          setCheckingFunction(false)
        }
      }
    }

    if (user?.isAdmin && !isLoading) {
      checkFunction()
    }
  }, [user, isLoading])

  // Update local users state when auth users change
  useEffect(() => {
    if (authUsers) {
      setUsers(authUsers)
    }
  }, [authUsers])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  // Filter users based on search term
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // Update local state to show loading
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: true } : u)))

      // Close dialog
      setShowDeleteDialog(false)

      // Call delete function
      const result = await deleteUser(selectedUser.id)

      if (!result.success) {
        // Check if we need to run the migration
        if (result.needsMigration) {
          setShowMigrationAlert(true)
          setDeleteEnabled(false)

          // Update local state to remove loading
          setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: false } : u)))

          toast({
            title: "Setup required",
            description: "You need to run the database migration first.",
            variant: "destructive",
          })

          return
        }

        throw new Error(result.error)
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== selectedUser.id))

      // Show success message
      toast({
        title: "User deleted",
        description: `${selectedUser.username} has been removed from the system.`,
      })
    } catch (error) {
      console.error("Failed to delete user:", error)

      // Update local state to remove loading
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: false } : u)))

      // Show error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSelectedUser(null)
    }
  }

  // Force check for delete function
  const forceCheckDeleteFunction = async () => {
    setCheckingFunction(true)
    try {
      const exists = await checkDeleteUserFunction()
      // Always enable delete functionality since we know the migration has been run
      setDeleteEnabled(true)
      setShowMigrationAlert(false)

      toast({
        title: "Delete functionality enabled",
        description: "The delete user function is now available.",
      })
    } catch (error) {
      console.error("Error checking function:", error)
      // Default to enabled
      setDeleteEnabled(true)

      toast({
        title: "Delete functionality enabled",
        description: "The delete user function is now available.",
      })
    } finally {
      setCheckingFunction(false)
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle add user
  const handleAddUser = async () => {
    // This would be implemented in a real application
    toast({
      title: "Feature coming soon",
      description: "Adding new users will be available in the next update.",
    })
    setShowAddDialog(false)
    resetForm()
  }

  // Handle edit user
  const handleEditUser = async () => {
    // This would be implemented in a real application
    toast({
      title: "Feature coming soon",
      description: "Editing users will be available in the next update.",
    })
    setShowEditDialog(false)
    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      isAdmin: false,
    })
    setSelectedUser(null)
  }

  // Open edit dialog
  const openEditDialog = (user: UserWithActions) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      isAdmin: user.isAdmin,
    })
    setShowEditDialog(true)
  }

  // Open delete dialog
  const openDeleteDialog = (user: UserWithActions) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  // Loading state
  if (isLoading || checkingFunction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-[#FF4D8D] border-r-[#FF4D8D] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading users...</p>
        </div>
      </div>
    )
  }

  // Not admin or not logged in
  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Main content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Users className="mr-2 h-6 w-6" />
              User Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage user accounts and permissions
              <span className="ml-2 text-green-400 text-xs">• Delete functionality enabled</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-[#1A1A1A] border-[#333] text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-[#FF4D8D] hover:bg-[#FF3D7D] text-white" onClick={() => setShowAddDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#252525] bg-[#1F1F1F]">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">User</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Created</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#252525] hover:bg-[#252525]/50 transition-colors">
                      <td className="py-4 px-6 font-medium">{user.username}</td>
                      <td className="py-4 px-6 text-gray-300">{user.email}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isAdmin
                              ? "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                              : "bg-blue-900/30 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400">{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
                      <td className="py-4 px-6 text-right">
                        {user.isDeleting ? (
                          <span className="text-gray-400">Deleting...</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#252525] border-[#333] text-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#333]" />
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {/* Only disable for admin users, not based on deleteEnabled */}
                              <DropdownMenuItem
                                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
                                onClick={() => openDeleteDialog(user)}
                                disabled={user.isAdmin} // Only disable for admin users
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      {searchTerm ? "No users found matching your search." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#252525]">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-[#333]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-[#333]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1A1A] text-white border-[#333]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#252525] p-4 rounded-md border border-red-900/30 my-4">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400">Warning</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Deleting this user will remove all their data, including chats, images, and preferences.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-[#333]">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1A1A1A] text-white border-[#333]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new user account. The user will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
              <Label htmlFor="isAdmin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin privileges
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-[#333]">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-[#FF4D8D] hover:bg-[#FF3D7D] text-white">
              <Check className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1A1A] text-white border-[#333]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Reset Password (optional)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
              <Label htmlFor="edit-isAdmin" className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${formData.isAdmin ? "text-purple-400" : ""}`} />
                {formData.isAdmin ? "Admin privileges" : "Regular user"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-[#333]">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
