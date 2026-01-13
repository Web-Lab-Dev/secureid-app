import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import { PartnershipSchema, validateInput } from '@/lib/api-validation';
import { logApiRequest, logApiError, addCorrelationIdHeader } from '@/lib/api-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validation stricte avec Zod
    const validation = validateInput(PartnershipSchema, body);

    if (!validation.success) {
      // Log tentative avec données invalides (sécurité)
      await logApiRequest(request, 'partnership_validation_failed', {
        errors: validation.errors,
        hasEtablissement: !!body.etablissement,
      });

      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Données validées et typées
    const { etablissement, type, responsable, email, telephone, ville, nombreEleves, message } = validation.data;

    // Configuration du transporteur SMTP
    // Note: En production, utiliser des variables d'environnement sécurisées
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Ou autre service SMTP
      auth: {
        user: process.env.SMTP_USER || 'tko364796@gmail.com',
        pass: process.env.SMTP_PASS || '', // IMPORTANT: Ajouter le mot de passe dans .env.local
      },
    });

    // Contenu de l'email
    const emailContent = `
Nouvelle demande de partenariat école SecureID
=============================================

INFORMATIONS ÉTABLISSEMENT
--------------------------
Nom établissement : ${etablissement}
Type : ${type === 'ecole' ? 'École' : type === 'garderie' ? 'Garderie' : type === 'centre' ? "Centre d'accueil" : 'Autre'}
Ville : ${ville}
Nombre d'élèves : ${nombreEleves || 'Non renseigné'}

CONTACT RESPONSABLE
-------------------
Nom : ${responsable}
Email : ${email}
Téléphone : ${telephone || 'Non renseigné'}

MESSAGE
-------
${message || 'Aucun message'}

---
Email envoyé automatiquement depuis SecureID Landing Page
Date : ${new Date().toLocaleString('fr-FR')}
    `.trim();

    // Envoi de l'email
    const info = await transporter.sendMail({
      from: `"SecureID Partenariats" <${process.env.SMTP_USER || 'tko364796@gmail.com'}>`,
      to: 'tko364796@gmail.com',
      subject: `[SecureID] Nouvelle demande partenariat - ${etablissement}`,
      text: emailContent,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${emailContent}</pre>`,
    });

    // Log succès avec contexte complet
    const duration = Date.now() - startTime;
    await logApiRequest(request, 'partnership_requested', {
      etablissement,
      type,
      email,
      ville,
      nombreEleves: nombreEleves || 0,
      messageId: info.messageId,
      duration,
    });

    // Ajouter correlation ID à la réponse pour traçabilité
    const headers = addCorrelationIdHeader(request);

    return NextResponse.json(
      {
        success: true,
        message: 'Demande envoyée avec succès',
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Log erreur avec contexte complet
    logApiError(request, 'partnership_request_failed', error, {
      hasBody: !!request.body,
    });

    return NextResponse.json(
      {
        error: 'Erreur lors de l\'envoi de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
