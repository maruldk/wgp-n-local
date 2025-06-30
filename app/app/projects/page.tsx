
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FolderKanban, 
  Plus, 
  Search,
  Calendar,
  Users,
  Target,
  Clock,
  Euro,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Filter,
  Eye,
  Edit,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?status=${statusFilter}&search=${searchTerm}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-700';
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PLANNING': 'Planung',
      'ACTIVE': 'Aktiv',
      'ON_HOLD': 'Pausiert',
      'COMPLETED': 'Abgeschlossen',
      'CANCELLED': 'Abgebrochen'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'ACTIVE':
        return <PlayCircle className="h-4 w-4 text-green-600" />;
      case 'ON_HOLD':
        return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FolderKanban className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateProjectProgress = (project: any) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task: any) => task.status === 'DONE').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const calculateStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;
    const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

    return { totalProjects, activeProjects, completedProjects, totalBudget };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projekte</h1>
          <p className="text-gray-600 mt-2">
            Verwalten und überwachen Sie alle Ihre Projekte
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Neues Projekt
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            title: 'Gesamt Projekte', 
            value: stats.totalProjects, 
            icon: FolderKanban,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          { 
            title: 'Aktive Projekte', 
            value: stats.activeProjects, 
            icon: PlayCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          { 
            title: 'Abgeschlossen', 
            value: stats.completedProjects, 
            icon: CheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          { 
            title: 'Budget gesamt', 
            value: formatCurrency(stats.totalBudget), 
            icon: Euro,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Projekte durchsuchen..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="PLANNING">Planung</SelectItem>
            <SelectItem value="ACTIVE">Aktiv</SelectItem>
            <SelectItem value="ON_HOLD">Pausiert</SelectItem>
            <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
            <SelectItem value="CANCELLED">Abgebrochen</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any, index: number) => {
              const progress = calculateProjectProgress(project);
              const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
              const totalTasks = project.tasks?.length || 0;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getStatusIcon(project.status)}
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {project.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Fortschritt</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {completedTasks} von {totalTasks} Aufgaben abgeschlossen
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Start</span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {formatDate(project.startDate)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Target className="h-4 w-4" />
                              <span>Ende</span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {formatDate(project.endDate)}
                            </div>
                          </div>
                        </div>

                        {/* Budget */}
                        {project.budget && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Euro className="h-4 w-4" />
                              <span className="text-sm">Budget</span>
                            </div>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(project.budget)}
                            </span>
                          </div>
                        )}

                        {/* Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Team</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {project._count?.members || project.members?.length || 0} Mitglieder
                            </span>
                            {project.manager && (
                              <Badge variant="outline" className="text-xs">
                                {project.manager.name || project.manager.email}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Milestones */}
                        {project.milestones && project.milestones.length > 0 && (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Meilensteine</span>
                              <span className="font-medium">
                                {project.milestones.filter((m: any) => m.isCompleted).length} / {project.milestones.length}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Projekte gefunden
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Keine Projekte entsprechen Ihren Suchkriterien.' 
                  : 'Erstellen Sie Ihr erstes Projekt.'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Projekt erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Project Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Projektvorlagen</CardTitle>
            <CardDescription>
              Schnell starten mit vorgefertigten Projektstrukturen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Software Entwicklung',
                  description: 'Agile Entwicklung mit Sprints und User Stories',
                  icon: PlayCircle,
                  estimatedDuration: '3-6 Monate'
                },
                {
                  name: 'Marketing Kampagne',
                  description: 'Komplette Kampagnenplanung von Konzept bis Launch',
                  icon: Target,
                  estimatedDuration: '2-4 Monate'
                },
                {
                  name: 'Beratungsprojekt',
                  description: 'Strukturierte Beratung mit Analyse und Umsetzung',
                  icon: Users,
                  estimatedDuration: '1-3 Monate'
                }
              ].map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.name}
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.estimatedDuration}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Verwenden
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
