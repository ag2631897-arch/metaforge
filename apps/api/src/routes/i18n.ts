/**
 * Multi-Language (i18n) Routes
 * 
 * Manages translations and locale configuration for MetaForge apps.
 * Supports CRUD operations on translation messages and locale management.
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';

// Default translations for the MetaForge platform itself
const PLATFORM_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'Build apps from metadata',
    'nav.apps': 'Apps',
    'nav.build': 'Build',
    'nav.templates': 'Templates',
    'nav.api': 'API',
    'nav.docs': 'Docs',
    'nav.notifications': 'Notifications',
    'actions.create': 'Create',
    'actions.save': 'Save',
    'actions.delete': 'Delete',
    'actions.cancel': 'Cancel',
    'actions.export': 'Export',
    'actions.import': 'Import',
    'actions.deploy': 'Deploy',
    'actions.download': 'Download',
    'status.live': 'Live',
    'status.draft': 'Draft',
    'status.deploying': 'Deploying',
    'status.error': 'Error',
    'notifications.title': 'Notifications',
    'notifications.empty': 'No notifications yet',
    'notifications.markAllRead': 'Mark all as read',
    'workflows.title': 'Workflows',
    'workflows.trigger': 'Trigger Workflow',
    'workflows.noWorkflows': 'No workflows defined',
  },
  es: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'Crea aplicaciones desde metadatos',
    'nav.apps': 'Aplicaciones',
    'nav.build': 'Construir',
    'nav.templates': 'Plantillas',
    'nav.api': 'API',
    'nav.docs': 'Documentación',
    'nav.notifications': 'Notificaciones',
    'actions.create': 'Crear',
    'actions.save': 'Guardar',
    'actions.delete': 'Eliminar',
    'actions.cancel': 'Cancelar',
    'actions.export': 'Exportar',
    'actions.import': 'Importar',
    'actions.deploy': 'Desplegar',
    'actions.download': 'Descargar',
    'status.live': 'En vivo',
    'status.draft': 'Borrador',
    'status.deploying': 'Desplegando',
    'status.error': 'Error',
    'notifications.title': 'Notificaciones',
    'notifications.empty': 'Sin notificaciones',
    'notifications.markAllRead': 'Marcar todo como leído',
    'workflows.title': 'Flujos de trabajo',
    'workflows.trigger': 'Activar flujo',
    'workflows.noWorkflows': 'No hay flujos definidos',
    'dashboard.workspace': 'Espacio de Trabajo',
    'dashboard.title': 'Tus Aplicaciones',
    'dashboard.subtitle': 'Gestiona aplicaciones generadas, configuraciones, automatizaciones y estado de despliegue desde un solo lugar.',
    'dashboard.filter': 'Filtrar aplicaciones...',
    'dashboard.totalApps': 'Total de Apps',
    'dashboard.live': 'en vivo',
    'dashboard.requests': 'Peticiones Hoy',
    'dashboard.activity': 'Actividad de despliegue y flujo',
    'dashboard.storage': 'Almacenamiento Usado',
    'dashboard.storageCaption': 'Configuraciones y logs guardados',
    'dashboard.noApps': 'No hay aplicaciones aún',
    'dashboard.noMatch': 'No hay coincidencias',
    'dashboard.noAppsDesc': 'Crea tu primera aplicación con IA, patrones preconstruidos o funciones sin código.',
    'dashboard.noMatchDesc': 'Ajusta el filtro de búsqueda para encontrar otra aplicación.',
    'app.noDesc': 'Aún no hay descripción. Añade contexto en el editor de configuración.',
    'app.entities': 'Entidades',
    'app.pages': 'Páginas',
    'app.ui': 'UI',
    'app.flows': 'Flujos',
    'app.overview': 'Resumen',
    'app.workflow': 'Flujos',
    'app.preview': 'Vista Previa',
    'app.deployed': 'Desplegado',
    'app.notDeployed': 'No desplegado',
  },
  fr: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'Créez des applications à partir de métadonnées',
    'nav.apps': 'Applications',
    'nav.build': 'Construire',
    'nav.templates': 'Modèles',
    'nav.api': 'API',
    'nav.docs': 'Documentation',
    'nav.notifications': 'Notifications',
    'actions.create': 'Créer',
    'actions.save': 'Enregistrer',
    'actions.delete': 'Supprimer',
    'actions.cancel': 'Annuler',
    'actions.export': 'Exporter',
    'actions.import': 'Importer',
    'actions.deploy': 'Déployer',
    'actions.download': 'Télécharger',
    'status.live': 'En direct',
    'status.draft': 'Brouillon',
    'status.deploying': 'En cours',
    'status.error': 'Erreur',
    'notifications.title': 'Notifications',
    'notifications.empty': 'Aucune notification',
    'notifications.markAllRead': 'Tout marquer comme lu',
    'workflows.title': 'Flux de travail',
    'workflows.trigger': 'Déclencher le flux',
    'workflows.noWorkflows': 'Aucun flux défini',
    'dashboard.workspace': 'Espace de Travail',
    'dashboard.title': 'Vos Applications',
    'dashboard.subtitle': 'Gérez les applications générées, les configurations, les automatisations et l\'état du déploiement en un seul endroit.',
    'dashboard.filter': 'Filtrer les applications...',
    'dashboard.totalApps': 'Total des Apps',
    'dashboard.live': 'en direct',
    'dashboard.requests': 'Requêtes Aujourd\'hui',
    'dashboard.activity': 'Activité de déploiement et de flux',
    'dashboard.storage': 'Stockage Utilisé',
    'dashboard.storageCaption': 'Configurations et journaux enregistrés',
    'dashboard.noApps': 'Pas encore d\'applications',
    'dashboard.noMatch': 'Aucune application correspondante',
    'dashboard.noAppsDesc': 'Créez votre première application avec l\'IA, des modèles d\'interface ou des fonctionnalités no-code.',
    'dashboard.noMatchDesc': 'Ajustez le filtre de recherche pour trouver une autre application.',
    'app.noDesc': 'Aucune description. Ajoutez du contexte dans l\'éditeur.',
    'app.entities': 'Entités',
    'app.pages': 'Pages',
    'app.ui': 'Interface',
    'app.flows': 'Flux',
    'app.overview': 'Aperçu',
    'app.workflow': 'Flux',
    'app.preview': 'Aperçu',
    'app.deployed': 'Déployé',
    'app.notDeployed': 'Non déployé',
  },
  de: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'Apps aus Metadaten erstellen',
    'nav.apps': 'Anwendungen',
    'nav.build': 'Erstellen',
    'nav.templates': 'Vorlagen',
    'nav.api': 'API',
    'nav.docs': 'Dokumentation',
    'nav.notifications': 'Benachrichtigungen',
    'actions.create': 'Erstellen',
    'actions.save': 'Speichern',
    'actions.delete': 'Löschen',
    'actions.cancel': 'Abbrechen',
    'actions.export': 'Exportieren',
    'actions.import': 'Importieren',
    'actions.deploy': 'Bereitstellen',
    'actions.download': 'Herunterladen',
    'status.live': 'Live',
    'status.draft': 'Entwurf',
    'status.deploying': 'Bereitstellung',
    'status.error': 'Fehler',
    'notifications.title': 'Benachrichtigungen',
    'notifications.empty': 'Keine Benachrichtigungen',
    'notifications.markAllRead': 'Alle als gelesen markieren',
    'workflows.title': 'Arbeitsabläufe',
    'workflows.trigger': 'Workflow auslösen',
    'workflows.noWorkflows': 'Keine Workflows definiert',
  },
  hi: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'मेटाडेटा से ऐप्स बनाएं',
    'nav.apps': 'ऐप्स',
    'nav.build': 'बनाएं',
    'nav.templates': 'टेम्पलेट्स',
    'nav.api': 'API',
    'nav.docs': 'दस्तावेज़',
    'nav.notifications': 'सूचनाएं',
    'actions.create': 'बनाएं',
    'actions.save': 'सहेजें',
    'actions.delete': 'हटाएं',
    'actions.cancel': 'रद्द करें',
    'actions.export': 'निर्यात',
    'actions.import': 'आयात',
    'actions.deploy': 'तैनात करें',
    'actions.download': 'डाउनलोड',
    'status.live': 'लाइव',
    'status.draft': 'ड्राफ़्ट',
    'status.deploying': 'तैनाती जारी',
    'status.error': 'त्रुटि',
    'notifications.title': 'सूचनाएं',
    'notifications.empty': 'कोई सूचना नहीं',
    'notifications.markAllRead': 'सब पढ़ा हुआ करें',
    'workflows.title': 'कार्यप्रवाह',
    'workflows.trigger': 'कार्यप्रवाह शुरू करें',
    'workflows.noWorkflows': 'कोई कार्यप्रवाह नहीं',
  },
  ja: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'メタデータからアプリを構築',
    'nav.apps': 'アプリ',
    'nav.build': '作成',
    'nav.templates': 'テンプレート',
    'nav.api': 'API',
    'nav.docs': 'ドキュメント',
    'nav.notifications': '通知',
    'actions.create': '作成',
    'actions.save': '保存',
    'actions.delete': '削除',
    'actions.cancel': 'キャンセル',
    'actions.export': 'エクスポート',
    'actions.import': 'インポート',
    'actions.deploy': 'デプロイ',
    'actions.download': 'ダウンロード',
    'status.live': 'ライブ',
    'status.draft': '下書き',
    'status.deploying': 'デプロイ中',
    'status.error': 'エラー',
    'notifications.title': '通知',
    'notifications.empty': '通知はありません',
    'notifications.markAllRead': 'すべて既読にする',
    'workflows.title': 'ワークフロー',
    'workflows.trigger': 'ワークフローを実行',
    'workflows.noWorkflows': 'ワークフローがありません',
  },
  zh: {
    'app.title': 'MetaForge Studio',
    'app.tagline': '从元数据构建应用',
    'nav.apps': '应用',
    'nav.build': '构建',
    'nav.templates': '模板',
    'nav.api': 'API',
    'nav.docs': '文档',
    'nav.notifications': '通知',
    'actions.create': '创建',
    'actions.save': '保存',
    'actions.delete': '删除',
    'actions.cancel': '取消',
    'actions.export': '导出',
    'actions.import': '导入',
    'actions.deploy': '部署',
    'actions.download': '下载',
    'status.live': '运行中',
    'status.draft': '草稿',
    'status.deploying': '部署中',
    'status.error': '错误',
    'notifications.title': '通知',
    'notifications.empty': '暂无通知',
    'notifications.markAllRead': '全部标为已读',
    'workflows.title': '工作流',
    'workflows.trigger': '触发工作流',
    'workflows.noWorkflows': '暂无工作流',
  },
  ar: {
    'app.title': 'MetaForge Studio',
    'app.tagline': 'إنشاء تطبيقات من البيانات الوصفية',
    'nav.apps': 'التطبيقات',
    'nav.build': 'بناء',
    'nav.templates': 'القوالب',
    'nav.api': 'API',
    'nav.docs': 'المستندات',
    'nav.notifications': 'الإشعارات',
    'actions.create': 'إنشاء',
    'actions.save': 'حفظ',
    'actions.delete': 'حذف',
    'actions.cancel': 'إلغاء',
    'actions.export': 'تصدير',
    'actions.import': 'استيراد',
    'actions.deploy': 'نشر',
    'actions.download': 'تحميل',
    'status.live': 'مباشر',
    'status.draft': 'مسودة',
    'status.deploying': 'جار النشر',
    'status.error': 'خطأ',
    'notifications.title': 'الإشعارات',
    'notifications.empty': 'لا توجد إشعارات',
    'notifications.markAllRead': 'تحديد الكل كمقروء',
    'workflows.title': 'سير العمل',
    'workflows.trigger': 'تشغيل سير العمل',
    'workflows.noWorkflows': 'لا يوجد سير عمل',
  },
};

const SUPPORTED_LOCALES = Object.keys(PLATFORM_TRANSLATIONS);

export async function i18nRoutes(app: FastifyInstance) {

  // GET /api/v1/i18n/locales — List supported locales
  app.get('/i18n/locales', async () => ({
    success: true,
    data: {
      locales: SUPPORTED_LOCALES.map(code => ({
        code,
        name: new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code,
        nativeName: new Intl.DisplayNames([code], { type: 'language' }).of(code) || code,
      })),
      defaultLocale: 'en',
    },
  }));

  // GET /api/v1/i18n/messages/:locale — Get translations for a locale
  app.get('/i18n/messages/:locale', async (request, reply) => {
    const { locale } = request.params as { locale: string };

    const messages = PLATFORM_TRANSLATIONS[locale];
    if (!messages) {
      return reply.status(404).send({
        success: false,
        error: { code: 'UNSUPPORTED_LOCALE', message: `Locale "${locale}" is not supported` },
      });
    }

    return {
      success: true,
      data: {
        locale,
        messages,
        keyCount: Object.keys(messages).length,
      },
    };
  });

  // GET /api/v1/i18n/messages — Get all locale translations
  app.get('/i18n/messages', async () => ({
    success: true,
    data: {
      locales: SUPPORTED_LOCALES,
      messages: PLATFORM_TRANSLATIONS,
      defaultLocale: 'en',
    },
  }));

  // GET /api/v1/apps/:appId/i18n — Get app-specific i18n config
  app.get('/apps/:appId/i18n', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const config = found.configJson as any;
    const i18n = config?.i18n || {
      defaultLocale: 'en',
      supportedLocales: ['en'],
      namespaces: ['common', 'app'],
      messages: {},
    };

    return { success: true, data: i18n };
  });

  // PUT /api/v1/apps/:appId/i18n — Update app-specific i18n config
  app.put('/apps/:appId/i18n', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const body = request.body as any;
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const config = (found.configJson && typeof found.configJson === 'object')
      ? { ...(found.configJson as any) }
      : {};

    config.i18n = {
      defaultLocale: body.defaultLocale || 'en',
      supportedLocales: body.supportedLocales || ['en'],
      namespaces: body.namespaces || ['common', 'app'],
      messages: body.messages || {},
    };

    await prisma.app.update({
      where: { id: appId },
      data: { configJson: config },
    });

    return { success: true, data: config.i18n };
  });
}
