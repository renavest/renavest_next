import { ClientNote, Client } from '../types';

export function exportClientNotes(notes: ClientNote[], client: Client): void {
  try {
    // Create comprehensive text export
    const exportData = notes
      .map((note) => {
        const date = new Date(note.createdAt).toLocaleString();
        const sections = [];

        sections.push(`TITLE: ${note.title}`);
        sections.push(`DATE: ${date}`);
        sections.push(`CATEGORY: ${note.content.category || 'General'}`);
        sections.push(`CLIENT: ${client.firstName} ${client.lastName || ''} (${client.email})`);
        sections.push('');

        if (note.content.keyObservations?.length) {
          sections.push('KEY OBSERVATIONS:');
          note.content.keyObservations.forEach((obs) => sections.push(`• ${obs}`));
          sections.push('');
        }

        if (note.content.clinicalAssessment) {
          sections.push('CLINICAL ASSESSMENT:');
          sections.push(note.content.clinicalAssessment);
          sections.push('');
        }

        if (note.content.treatmentPlan) {
          sections.push('TREATMENT PLAN:');
          sections.push(note.content.treatmentPlan);
          sections.push('');
        }

        if (note.content.riskAssessment) {
          sections.push('RISK ASSESSMENT:');
          sections.push(note.content.riskAssessment);
          sections.push('');
        }

        if (note.content.additionalContext) {
          sections.push('ADDITIONAL NOTES:');
          sections.push(note.content.additionalContext);
          sections.push('');
        }

        if (note.content.actionItems?.length) {
          sections.push('ACTION ITEMS:');
          note.content.actionItems.forEach((item) => sections.push(`• ${item}`));
          sections.push('');
        }

        if (note.content.followUpNeeded?.length) {
          sections.push('FOLLOW UP NEEDED:');
          note.content.followUpNeeded.forEach((item) => sections.push(`• ${item}`));
          sections.push('');
        }

        return sections.join('\n');
      })
      .join('\n' + '='.repeat(80) + '\n\n');

    // Create downloadable file
    const blob = new Blob(
      [
        `CONFIDENTIAL CLINICAL NOTES\n`,
        `Client: ${client.firstName} ${client.lastName || ''}\n`,
        `Export Date: ${new Date().toLocaleString()}\n`,
        `Total Notes: ${notes.length}\n\n`,
        '='.repeat(80) + '\n\n',
        exportData,
      ],
      { type: 'text/plain' },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.firstName}_${client.lastName || 'Client'}_Notes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting notes:', error);
    throw error;
  }
}
