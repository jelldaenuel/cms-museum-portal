/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import supabase from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"
import { Camera, Heart, ImageIcon, MessageCircle, X } from "lucide-react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import useCurrentUser from "../authentication/useCurrentUser"

// Import the ImageCarousel component
import ImageCarousel from "./visitor-experience-carousel"

interface Post {
  post_id: string
  user_uid: string
  firstName?: string,
  lastName?: string,
  visitorImg: string,
  content: string
  images: string[]
  created_at: string
  likes: number
  comments: number
  shares: number
}

const VisitorExperiencePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [postContent, setPostContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  // Get user profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", (currentUser as any)?.visitor_id],
    enabled: !!(currentUser as any)?.visitor_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("visitor")
        .select("*")
        .eq("visitor_id", (currentUser as any).visitor_id)
        .single()
      return data
    }
  })

  // Fetch trending posts
  const { data: trendingPosts, isLoading: loadingTrending } = useQuery({
    queryKey: ["posts", "trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts_with_users")
        .select(
          `
            post_id,
            user_uid,
            content,
            images,
            created_at,
            likes,
            comments,
            shares,
            firstName,
            lastName,
            visitorImg
          `
        )
        .order("likes", { ascending: false })
        .limit(10)
      return data?.map(post => ({
        ...post,
        created_at: new Date(post.created_at).toLocaleString()
      })) || []
    }
  })

  // Fetch latest posts
  const { data: latestPosts, isLoading: loadingLatest } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts_with_users")
        .select(
          `
            post_id,
            user_uid,
            content,
            images,
            created_at,
            likes,
            comments,
            shares,
            firstName,
            lastName,
            visitorImg
          `
        )
        .order("created_at", { ascending: false })
        .limit(10)
      return data?.map(post => ({
        ...post,
        created_at: new Date(post.created_at).toLocaleString()
      })) || []
    }
  })

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (selectedImages.length + files.length > 5) {
        toast.warning("You can upload a maximum of 5 images per post.")
        return
      }
      setSelectedImages(prev => [...prev, ...files])
      setPreviewUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))])
    }
  }

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="flex-1">
      <div className="container grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 p-4 md:p-6">
        <div className="space-y-6">
          {/* Post creation area */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">Share Your Museum Experience</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src={userProfile?.visitorImg || "/placeholder.svg?height=40&width=40"} alt="Your Avatar" />
                  <AvatarFallback>{userProfile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Share your museum experience..."
                    className="rounded-xl bg-muted"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={url}
                            alt={`Selected image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for posts */}
          <Tabs defaultValue="trending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            {/* Trending tab */}
            <TabsContent value="trending" className="space-y-4 mt-4">
              {loadingTrending ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : trendingPosts?.length === 0 ? (
                <Card className="p-6 text-center">
                  <p>No trending posts found.</p>
                </Card>
              ) : (
                trendingPosts?.map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))
              )}
            </TabsContent>

            {/* Latest tab */}
            <TabsContent value="latest" className="space-y-4 mt-4">
              {loadingLatest ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : latestPosts?.length === 0 ? (
                <Card className="p-6 text-center">
                  <p>No recent posts found.</p>
                </Card>
              ) : (
                latestPosts?.map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

// PostCard component with red heart toggle (without changing likes)
interface PostCardProps {
  post: Post
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false) // Local toggle state

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post?.visitorImg || "/placeholder.svg?height=40&width=40"} alt={post?.firstName} />
          <AvatarFallback>{post?.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post?.firstName}</span>
            <span className="text-xs text-muted-foreground">@{post?.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{post.created_at}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {post.content && (
          <div className="px-4 pb-4">
            <p className="text-sm">{post.content}</p>
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className="w-full">
            <ImageCarousel images={post.images} aspectRatio="square" height="h-80" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4">
        <div className="flex items-center gap-6 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${liked ? "text-red-500" : ""}`}
            onClick={() => setLiked(!liked)}
          >
            <Heart className="h-4 w-4" />
            <span>{post.likes}</span> {/* count stays the same */}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default VisitorExperiencePage
