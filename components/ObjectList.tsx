'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, Trash2, Calendar } from 'lucide-react';
import { ObjectItem, objectsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import io from 'socket.io-client';

interface ObjectListProps {
    onObjectSelect?: (object: ObjectItem) => void;
    viewMode?: 'grid' | 'list';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ObjectList({ onObjectSelect, viewMode = 'grid' }: ObjectListProps) {
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        fetchObjects();
        setupWebSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const fetchObjects = async () => {
        try {
            setLoading(true);
            console.log('🔄 Chargement des objets...');
            const data = await objectsApi.getAll();
            console.log(`✅ ${data.length} objets chargés`);
            setObjects(data);
        } catch (error) {
            console.error('❌ Erreur chargement objets:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupWebSocket = () => {
        console.log('🔌 Connexion WebSocket...');
        const newSocket = io(API_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket connecté');
        });

        newSocket.on('object:created', (newObject: ObjectItem) => {
            console.log('📦 Nouvel objet reçu:', newObject);
            setObjects(prev => [newObject, ...prev]);
        });

        newSocket.on('object:deleted', ({ id }: { id: string }) => {
            console.log('🗑️ Objet supprimé reçu:', id);
            setObjects(prev => prev.filter(obj => obj.id !== id));
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket déconnecté');
        });

        setSocket(newSocket);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) return;

        try {
            setDeletingId(id);
            console.log(`🗑️ Suppression de l'objet ${id}...`);
            await objectsApi.delete(id);
            // La suppression sera confirmée via WebSocket
            console.log(`✅ Demande de suppression envoyée pour ${id}`);
        } catch (error: any) {
            console.error('❌ Erreur suppression:', error);
            alert(`Erreur lors de la suppression: ${error.message || 'Veuillez réessayer'}`);
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <span className="text-gray-600">Chargement des objets...</span>
            </div>
        );
    }

    if (objects.length === 0) {
        return (
            <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objet trouvé</h3>
                <p className="text-gray-500">Créez votre premier objet pour commencer</p>
            </div>
        );
    }

    // Vue en grille
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {objects.map((object) => (
                    <Card key={object.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <div className="relative h-48 bg-gray-100">
                            <img
                                src={object.image_url}
                                alt={object.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                                }}
                            />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => handleDelete(object.id)}
                                disabled={deletingId === object.id}
                            >
                                {deletingId === object.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{object.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{object.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(object.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Vue en liste
    return (
        <div className="space-y-4">
            {objects.map((object) => (
                <Card key={object.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                            <img
                                src={object.image_url}
                                alt={object.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                                }}
                            />
                        </div>
                        <div className="flex-1 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">{object.title}</h3>
                                    <p className="text-gray-600 mb-4">{object.description}</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{formatDate(object.created_at)}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(object.id)}
                                    disabled={deletingId === object.id}
                                    className="self-start"
                                >
                                    {deletingId === object.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}