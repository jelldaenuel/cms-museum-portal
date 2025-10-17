/* eslint-disable @typescript-eslint/no-explicit-any */
import PostCard from "../components/ui/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import supabase from "@/lib/supabase"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, Heart, ImageIcon, MessageCircle, X } from "lucide-react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import useCurrentUser from "../authentication/useCurrentUser"
import ImageCarousel from "./visitor-experience-carousel"

interface Post {
  post_id: string
  user_uid: string
  firstName?: string
  lastName?: string
  visitorImg: string
  content: string
  images: string[]
  created_at: string
  likes: number
  comments: number
  shares: number
}

const VisitorExperiencePage = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [postContent, setPostContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedExhibition, setSelectedExhibition] = useState("")
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user: currentUser } = useCurrentUser()
  const navigate = useNavigate()

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

  // Trending posts
  const { data: trendingPosts, isLoading: loadingTrending } = useQuery({
    queryKey: ["posts", "trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts_with_users")
        .select("post_id, user_uid, content, images, created_at, likes, comments, shares, firstName, lastName, visitorImg")
        .order("likes", { ascending: false })
        .limit(10)

      return (
        data?.map(post => ({
          ...post,
          created_at: new Date(post.created_at).toLocaleString()
        })) || []
      )
    }
  })

  // Latest posts
  const { data: latestPosts, isLoading: loadingLatest } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts_with_users")
        .select("post_id, user_uid, content, images, created_at, likes, comments, shares, firstName, lastName, visitorImg")
        .order("created_at", { ascending: false })
        .limit(10)

      return (
        data?.map(post => ({
          ...post,
          created_at: new Date(post.created_at).toLocaleString()
        })) || []
      )
    }
  })

  // Events
  const { data: upcomingEvents } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(3)
      return data || []
    }
  })

  // Exhibitions
  const { data: popularExhibitions } = useQuery({
    queryKey: ["exhibitions", "popular"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exhibits")
        .select("*")
        .limit(3)
      return data || []
    }
  })

  // Create post
  const createPost = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: File[]; exhibition: string }) => {
      if (!currentUser) throw new Error("User not authenticated")

      const postId = uuidv4()
      const { data: posts, error: postError } = await supabase
        .from("experience_posts")
        .insert({
          user_uid: (currentUser as any).user_uid,
          content,
          images: [],
          created_at: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0
        })
        .select()

      if (postError) throw postError

      const imageUrls: string[] = []
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split(".").pop()
          const filePath = `experiences/${(currentUser as any).visitor_id}/${postId}/${Math.random()}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("museo_rizal").upload(filePath, image)
          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage.from("museo_rizal").getPublicUrl(filePath)
          imageUrls.push(publicUrl)
        }

        const { error: updateError } = await supabase
          .from("experience_posts")
          .update({ images: imageUrls })
          .eq("post_id", posts.at(0).post_id)
        if (updateError) throw updateError
      }

      return { id: postId, imageUrls }
    },
    onSuccess: () => {
      setPostContent("")
      setSelectedImages([])
      setPreviewUrls([])
      setSelectedExhibition("")
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast.success("Your experience has been shared.")
      setIsSubmitting(false)
    },
    onError: () => {
      toast.error("Failed to share your experience. Please try again.")
      setIsSubmitting(false)
    }
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (selectedImages.length + files.length > 5) {
        toast.warning("You can upload a maximum of 5 images per post.")
        return
      }
      setSelectedImages(prev => [...prev, ...files])
      const newPreviewUrls = files.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitPost = () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      toast.error("Please add some text or at least one image to share your experience.")
      return
    }
    setIsSubmitting(true)
    createPost.mutate({
      content: postContent.trim(),
      images: selectedImages,
      exhibition: selectedExhibition
    })
  }

  return (
    <main className="flex-1">
      <div className="container grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 p-4 md:p-6">
        <div className="space-y-6">
          {/* Create Post */}
          {/* Same content as before */}
          
          <Tabs defaultValue="trending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

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
                trendingPosts?.map((post) => <PostCard key={post.post_id} post={{ ...post }} />)
              )}
            </TabsContent>

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
                latestPosts?.map((post) => <PostCard key={post.post_id} post={{ ...post }} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

export default VisitorExperiencePage

// ❤️ Like visual only — no count shown
const PostCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post?.visitorImg || "/placeholder.svg"} alt={post?.firstName} />
          <AvatarFallback>{post?.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <span className="font-semibold">{post?.firstName} {post?.lastName}</span>
          <span className="text-xs text-muted-foreground">{post.created_at}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {post.content && <div className="px-4 pb-4"><p className="text-sm">{post.content}</p></div>}
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
            <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`} />
          </Button>

          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
