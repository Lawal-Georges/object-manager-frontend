'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { objectsApi } from '@/lib/api';

interface ObjectFormProps {
    onSuccess?: () => void;
}

export default function ObjectForm({ onSuccess }: ObjectFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Nouveau état

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);

            // Créer une preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Empêcher les soumissions multiples
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        // Validation
        if (!title.trim()) {
            setError('Le titre est requis');
            setIsSubmitting(false);
            return;
        }

        if (!description.trim()) {
            setError('La description est requise');
            setIsSubmitting(false);
            return;
        }

        if (!image) {
            setError('Une image est requise');
            setIsSubmitting(false);
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('image', image);

            console.log('🔄 Envoi de l\'objet...');

            await objectsApi.create(formData);
            console.log('✅ Objet créé avec succès');

            // Réinitialiser le formulaire
            setTitle('');
            setDescription('');
            setImage(null);
            setPreview(null);

            // Notifier le parent
            onSuccess?.();

        } catch (error: any) {
            console.error('❌ Erreur lors de la création:', error);
            setError(error.response?.data?.error || 'Erreur lors de la création');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Créer un nouvel objet
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Titre */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de l'objet"
                            disabled={loading || isSubmitting}
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description de l'objet"
                            rows={4}
                            disabled={loading || isSubmitting}
                            className="w-full"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Image *</Label>

                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={handleRemoveImage}
                                    disabled={loading || isSubmitting}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="text-sm text-gray-600 mb-2">
                                        Cliquez pour télécharger une image
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        JPEG, PNG, GIF, WebP (max 10MB)
                                    </div>
                                </Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={loading || isSubmitting}
                                />
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || isSubmitting || !title || !description || !image}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Création en cours...
                            </>
                        ) : (
                            'Créer l\'objet'
                        )}
                    </Button>

                    {isSubmitting && !loading && (
                        <p className="text-xs text-gray-500 text-center">
                            Veuillez patienter...
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}