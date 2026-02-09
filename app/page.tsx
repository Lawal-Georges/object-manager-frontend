'use client';

import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff, Loader2, Grid3x3, List, Upload, Database, Zap, AlertCircle } from 'lucide-react';
import ObjectForm from '@/components/ObjectForm';
import ObjectList from '@/components/ObjectList';
import { objectsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [apiMessage, setApiMessage] = useState<string>('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [stats, setStats] = useState({ objects: 0 });
    const [mobileView, setMobileView] = useState<'list' | 'create'>('list');

    useEffect(() => {
        checkApiStatus();
        fetchStats();

        // Vérifier l'API toutes les 30 secondes
        const interval = setInterval(checkApiStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkApiStatus = async () => {
        setApiStatus('checking');
        try {
            console.log('🔄 Vérification du statut API...');

            // Essayer plusieurs endpoints
            const endpoints = [
                { url: '/health', name: 'Health' },
                { url: '/', name: 'Root' },
                { url: '/api/objects', name: 'Objects API' }
            ];

            let isOnline = false;
            let message = '';

            for (const endpoint of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(`http://localhost:3001${endpoint.url}`, {
                        method: 'GET',
                        signal: controller.signal,
                        mode: 'cors',
                        cache: 'no-cache'
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        console.log(`✅ ${endpoint.name} accessible`);
                        isOnline = true;
                        message = `Connecté via ${endpoint.name}`;
                        break;
                    }
                } catch (error: any) {
                    console.warn(`⚠️ ${endpoint.name} failed:`, error.name, error.message);
                }
            }

            if (isOnline) {
                setApiStatus('online');
                setApiMessage(message);
                console.log('✅ API en ligne');
            } else {
                setApiStatus('offline');
                setApiMessage('API non accessible');
                console.log('❌ API hors ligne');
            }
        } catch (error) {
            console.error('🔥 Erreur de vérification API:', error);
            setApiStatus('offline');
            setApiMessage('Erreur de connexion');
        }
    };

    const fetchStats = async () => {
        try {
            const objects = await objectsApi.getAll();
            setStats({ objects: objects.length });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateSuccess = () => {
        setRefreshKey(prev => prev + 1);
        fetchStats();
        if (window.innerWidth < 1024) {
            setMobileView('list');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Grid3x3 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Object Manager</h1>
                                <p className="text-sm text-gray-500">Gérez vos objets en temps réel</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${apiStatus === 'online' ? 'bg-green-100 text-green-800 border border-green-200' : apiStatus === 'offline' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                                <div className={`h-2 w-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500 animate-pulse' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                <span className="text-sm font-medium">
                                    {apiStatus === 'online' ? 'API En ligne' : apiStatus === 'offline' ? 'API Hors ligne' : 'Vérification...'}
                                </span>
                                {apiStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                                {apiStatus === 'online' && <Wifi className="h-3 w-3" />}
                                {apiStatus === 'offline' && <WifiOff className="h-3 w-3" />}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={checkApiStatus}
                                disabled={apiStatus === 'checking'}
                                className="hidden sm:flex"
                            >
                                Actualiser
                            </Button>
                        </div>
                    </div>

                    {/* Message de statut */}
                    {apiMessage && (
                        <div className={`mt-3 text-sm ${apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                            {apiMessage}
                        </div>
                    )}
                </div>
            </header>

            {/* Navigation mobile */}
            <div className="lg:hidden border-b bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex">
                        <button
                            onClick={() => setMobileView('list')}
                            className={`flex-1 py-3 px-4 text-center font-medium ${mobileView === 'list' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <List className="h-4 w-4" />
                                <span>Liste ({stats.objects})</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setMobileView('create')}
                            className={`flex-1 py-3 px-4 text-center font-medium ${mobileView === 'create' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Créer</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Avertissement si API hors ligne */}
                {apiStatus === 'offline' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-red-800">API non accessible</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    Vérifiez que le backend est en cours d&apos;exécution sur http://localhost:3001
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={checkApiStatus}
                                    className="mt-2"
                                >
                                    Réessayer la connexion
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white border shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Objets</p>
                                    <p className="text-2xl font-bold">{stats.objects}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Grid3x3 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Statut API</p>
                                    <p className={`text-2xl font-bold ${apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                        {apiStatus === 'online' ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${apiStatus === 'online' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {apiStatus === 'online' ? (
                                        <Wifi className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <WifiOff className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Base de données</p>
                                    <p className="text-2xl font-bold">Supabase</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Database className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenu mobile */}
                <div className="lg:hidden">
                    {mobileView === 'list' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Mes objets</h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="flex items-center gap-1"
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                        Grille
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="flex items-center gap-1"
                                    >
                                        <List className="h-4 w-4" />
                                        Liste
                                    </Button>
                                </div>
                            </div>
                            <ObjectList key={refreshKey} viewMode={viewMode} />
                        </div>
                    ) : (
                        <Card className="bg-white border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <Plus className="h-5 w-5" />
                                    Créer un nouvel objet
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ObjectForm onSuccess={handleCreateSuccess} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Contenu desktop */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                    {/* Formulaire */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 bg-white border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <Plus className="h-5 w-5" />
                                    Nouvel objet
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ObjectForm onSuccess={handleCreateSuccess} />
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h4 className="font-medium text-gray-900 mb-2">⚡ Fonctionnalités</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>Mises à jour en <strong>temps réel</strong> via Socket.io</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Upload className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Images stockées sur <strong>Supabase Storage</strong></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Database className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>Base de données <strong>PostgreSQL</strong> sécurisée</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Liste d'objets */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-gray-900">Objets ({stats.objects})</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {apiStatus === 'online'
                                            ? 'Mises à jour en temps réel via WebSocket'
                                            : 'Mode hors ligne - rechargement manuel nécessaire'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="flex items-center gap-1"
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                        Grille
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="flex items-center gap-1"
                                    >
                                        <List className="h-4 w-4" />
                                        Liste
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            fetchStats();
                                            setRefreshKey(prev => prev + 1);
                                        }}
                                    >
                                        Rafraîchir
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ObjectList key={refreshKey} viewMode={viewMode} />
                            </CardContent>
                        </Card>

                        {/* Section informations techniques */}
                        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                            <CardContent className="pt-6">
                                <h3 className="font-bold text-gray-900 mb-3">📋 Système complet</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">API REST avec Express.js</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Base PostgreSQL (Supabase)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Upload images Supabase Storage</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Interface Next.js + shadcn/ui</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Mises à jour temps réel (Socket.io)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-green-700">✓</span>
                                            </div>
                                            <span className="text-sm text-gray-700">CRUD complet (Create, Read, Delete)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Technologies utilisées */}
                <div className="mt-12">
                    <h3 className="text-lg font-semibold text-center mb-6 text-gray-900">Technologies utilisées</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex p-3 bg-blue-100 rounded-lg mb-3">
                                <div className="h-8 w-8 text-blue-600 font-bold flex items-center justify-center">N</div>
                            </div>
                            <h4 className="font-medium mb-1">Next.js 14</h4>
                            <p className="text-xs text-gray-500">Frontend React</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex p-3 bg-green-100 rounded-lg mb-3">
                                <div className="h-8 w-8 text-green-600 font-bold flex items-center justify-center">S</div>
                            </div>
                            <h4 className="font-medium mb-1">Supabase</h4>
                            <p className="text-xs text-gray-500">PostgreSQL + Storage</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex p-3 bg-orange-100 rounded-lg mb-3">
                                <div className="h-8 w-8 text-orange-600 font-bold flex items-center justify-center">E</div>
                            </div>
                            <h4 className="font-medium mb-1">Express.js</h4>
                            <p className="text-xs text-gray-500">Backend API</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex p-3 bg-purple-100 rounded-lg mb-3">
                                <Zap className="h-8 w-8 text-purple-600" />
                            </div>
                            <h4 className="font-medium mb-1">Socket.io</h4>
                            <p className="text-xs text-gray-500">Temps réel</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded">
                                <Grid3x3 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Object Manager</span>
                        </div>
                        <div className="text-sm text-gray-500 text-center">
                            <p>Statut: {apiStatus === 'online' ? '✅ Système opérationnel' : '⚠️ Vérifiez le backend'}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                            <p>Dev fullstack eyum mouloby georges chanel</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}