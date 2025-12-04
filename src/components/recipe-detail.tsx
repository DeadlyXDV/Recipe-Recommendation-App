import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Globe, Bookmark, BookmarkCheck, ExternalLink, Heart, Trash2, Send, Share2, Copy, Check, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/auth-context';
import { recipeAPI } from '../lib/api';
import { translateArray, translateLongText } from '../lib/translate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface RecipeDetailProps {
  recipeId: string;
  onBack: () => void;
}

interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  strTags?: string;
  [key: string]: string | undefined;
}

interface Comment {
  id: number;
  user_id: number;
  recipe_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

export function RecipeDetail({ recipeId, onBack }: RecipeDetailProps) {
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, saveRecipe, unsaveRecipe, isRecipeSaved, toggleLike, isRecipeLiked } = useAuth();
  const isSaved = isRecipeSaved(recipeId);
  const isLiked = isRecipeLiked(recipeId);

  // Like state
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<number | null>(null);

  // Share state
  const [isCopied, setIsCopied] = useState(false);

  // Translation state
  const [translatedIngredients, setTranslatedIngredients] = useState<string[]>([]);
  const [translatedInstructions, setTranslatedInstructions] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
        );
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          setMeal(data.meals[0]);
        }
      } catch (error) {
        console.error('Error fetching recipe detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLikeCount = async () => {
      try {
        const response = await recipeAPI.getLikeCount(recipeId);
        if (response.success) {
          setLikeCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching like count:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await recipeAPI.getComments(recipeId);
        if (response.success) {
          setComments(response.data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchRecipeDetail();
    fetchLikeCount();
    fetchComments();
  }, [recipeId]);

  const handleSaveClick = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyimpan resep');
      return;
    }

    if (!meal) return;

    if (isSaved) {
      await unsaveRecipe(recipeId);
    } else {
      await saveRecipe(recipeId, meal.strMeal, meal.strMealThumb);
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyukai resep');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleLike(recipeId);
      setLikeCount(result.count);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Terjadi kesalahan saat memproses like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk mengomentari resep');
      return;
    }

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      alert('Komentar tidak boleh kosong');
      return;
    }

    if (trimmedComment.length > 500) {
      alert('Komentar maksimal 500 karakter');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await recipeAPI.addComment(recipeId, trimmedComment);
      if (response.success) {
        // Refresh comments
        const commentsResponse = await recipeAPI.getComments(recipeId);
        if (commentsResponse.success) {
          setComments(commentsResponse.data);
        }
        setCommentText('');
      } else {
        alert(response.message || 'Gagal menambahkan komentar');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Terjadi kesalahan saat menambahkan komentar');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      return;
    }

    setIsDeletingComment(commentId);
    try {
      const response = await recipeAPI.deleteComment(recipeId, commentId);
      if (response.success) {
        // Refresh comments
        const commentsResponse = await recipeAPI.getComments(recipeId);
        if (commentsResponse.success) {
          setComments(commentsResponse.data);
        }
      } else {
        alert(response.message || 'Gagal menghapus komentar');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Terjadi kesalahan saat menghapus komentar');
    } finally {
      setIsDeletingComment(null);
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleShare = async (platform: 'whatsapp' | 'twitter' | 'facebook' | 'copy') => {
    if (!meal) return;

    const shareUrl = window.location.href;
    const shareText = `Lihat resep ${meal.strMeal} yang lezat ini!`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          alert('Gagal menyalin link');
        }
        break;
    }
  };

  const getIngredients = (meal: MealDetail): Array<{ ingredient: string; measure: string }> => {
    const ingredients: Array<{ ingredient: string; measure: string }> = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || '',
        });
      }
    }
    return ingredients;
  };

  const handleTranslate = async () => {
    if (!meal || isTranslating) return;

    // Toggle: jika sudah translate, kembali ke bahasa asli
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);

    try {
      const ingredients = getIngredients(meal);
      
      // Translate ingredients (gabung ingredient + measure)
      const ingredientTexts = ingredients.map(ing => 
        `${ing.measure} ${ing.ingredient}`.trim()
      );
      
      const translatedIngs = await translateArray(ingredientTexts);
      setTranslatedIngredients(translatedIngs);

      // Translate instructions
      const translatedInst = await translateLongText(meal.strInstructions);
      setTranslatedInstructions(translatedInst);

      setIsTranslated(true);
    } catch (error) {
      console.error('Error translating:', error);
      alert('Gagal menerjemahkan resep. Silakan coba lagi.');
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Memuat detail resep...</p>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <p className="text-orange-600 mb-4">Resep tidak ditemukan</p>
          <Button onClick={onBack} variant="outline" className="border-orange-300 text-orange-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const ingredients = getIngredients(meal);
  const tags = meal.strTags ? meal.strTags.split(',') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Hasil
            </Button>
            <div className="flex items-center gap-3">
              {/* Translate Button */}
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Languages className="w-4 h-4 mr-2" />
                {isTranslating ? 'Menerjemahkan...' : isTranslated ? 'Bahasa Asli' : 'Terjemahkan'}
              </Button>

              {/* Share Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Bagikan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-600">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Salin Link
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Save Button */}
              <Button
                onClick={handleSaveClick}
                className={isSaved ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white hover:bg-orange-50 border border-orange-300 text-orange-700"}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Tersimpan
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Simpan Resep
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <ImageWithFallback
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl mb-3">{meal.strMeal}</h1>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <Globe className="w-3 h-3 mr-1" />
                  {meal.strArea}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <ChefHat className="w-3 h-3 mr-1" />
                  {meal.strCategory}
                </Badge>
                {tags.map((tag, index) => (
                  <Badge key={index} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Like Section */}
          <div className="flex items-center gap-4 mt-6">
            <Button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-all ${
                isLiked
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white hover:bg-red-50 border border-red-300 text-red-700'
              }`}
              style={{ transform: isLiking ? 'scale(0.95)' : 'scale(1)' }}
            >
              <Heart
                className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`}
                style={{ transform: isLiked ? 'scale(1.1)' : 'scale(1)' }}
              />
              {isLiked ? 'Disukai' : 'Suka'}
            </Button>
            <span className="text-gray-700 font-medium">
              {likeCount} {likeCount === 1 ? 'suka' : 'suka'}
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            {/* Ingredients Section */}
            <div className="lg:col-span-1">
              <Card className="border-orange-100 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-orange-900">
                    Bahan-Bahan
                    {isTranslated && (
                      <Badge className="ml-2 bg-green-100 text-green-700 border-green-300">
                        Diterjemahkan
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isTranslated ? (
                      // Tampilkan versi terjemahan
                      translatedIngredients.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <span className="text-gray-900">{item}</span>
                        </div>
                      ))
                    ) : (
                      // Tampilkan versi asli
                      ingredients.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start p-3 bg-orange-50 rounded-lg border border-orange-100"
                        >
                          <span className="text-orange-900 capitalize flex-1">{item.ingredient}</span>
                          <span className="text-orange-600 text-sm ml-2">{item.measure}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions Section */}
            <div className="lg:col-span-2">
              <Card className="border-orange-100">
                <CardHeader>
                  <CardTitle className="text-orange-900">
                    Cara Memasak
                    {isTranslated && (
                      <Badge className="ml-2 bg-green-100 text-green-700 border-green-300">
                        Diterjemahkan
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-orange max-w-none">
                    {isTranslated ? (
                      // Tampilkan versi terjemahan
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        {translatedInstructions.split('\n').map((paragraph, index) => {
                          if (!paragraph.trim()) return null;
                          
                          return (
                            <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      // Tampilkan versi asli
                      meal.strInstructions.split('\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;
                      
                      // Check if it's a numbered step
                      const stepMatch = paragraph.match(/^(\d+[\.)]\s*)/);
                      
                      if (stepMatch) {
                        return (
                          <div key={index} className="mb-6 flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                              {stepMatch[1].replace(/[.)\s]/g, '')}
                            </div>
                            <p className="text-gray-700 leading-relaxed pt-1">
                              {paragraph.replace(stepMatch[1], '').trim()}
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      );
                    })
                    )}
                  </div>

                  {/* YouTube Link */}
                  {meal.strYoutube && (
                    <div className="mt-8 pt-6 border-t border-orange-100">
                      <h4 className="text-orange-900 mb-3">Video Tutorial</h4>
                      <a
                        href={meal.strYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Tonton di YouTube
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Comments Section */}
          <Card className="border-orange-100 mt-8">
            <CardHeader>
              <CardTitle className="text-orange-900">
                Komentar ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              <div className="mb-6">
                <Textarea
                  placeholder={
                    user
                      ? 'Tulis komentar... (max 500 karakter)'
                      : 'Login untuk berkomentar'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!user || isSubmittingComment}
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {commentText.length}/500 karakter
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!user || !commentText.trim() || isSubmittingComment}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmittingComment ? 'Mengirim...' : 'Kirim'}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada komentar. Jadilah yang pertama!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-orange-900">
                              {comment.user_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(comment.created_at)}
                            </p>
                          </div>

                          {/* Delete Button - only show for comment owner */}
                          {user && comment.user_id === parseInt(user.id) && (
                            <Button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={isDeletingComment === comment.id}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white border-t border-orange-100">
        <div className="container mx-auto px-4 text-center text-sm text-orange-600">
          <p>Powered by TheMealDB API</p>
        </div>
      </footer>
    </div>
  );
}
