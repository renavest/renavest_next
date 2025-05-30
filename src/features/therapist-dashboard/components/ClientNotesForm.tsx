'use client';
import { useState } from 'react';
import { X, Save, Lock, Tag } from 'lucide-react';

import { ClientNoteContent, NoteCategory, NoteTemplate, CreateNoteRequest, Client } from '../types';

interface ClientNotesFormProps {
  client: Client;
  therapistId: number;
  template?: NoteTemplate;
  onSave: (note: CreateNoteRequest) => Promise<void>;
  onClose: () => void;
}

const categoryOptions: { value: NoteCategory; label: string }[] = [
  { value: 'session', label: 'Session Notes' },
  { value: 'intake', label: 'Intake Assessment' },
  { value: 'progress', label: 'Progress Review' },
  { value: 'crisis', label: 'Crisis/Safety' },
  { value: 'general', label: 'General Notes' },
  { value: 'discharge', label: 'Discharge' },
];

export function ClientNotesForm({
  client,
  therapistId,
  template,
  onSave,
  onClose,
}: ClientNotesFormProps) {
  const [title, setTitle] = useState(template?.name || '');
  const [content, setContent] = useState<ClientNoteContent>(template?.template || {});
  const [isConfidential, setIsConfidential] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        userId: parseInt(client.id),
        title: title.trim(),
        content,
        isConfidential,
      });
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (key: keyof ClientNoteContent, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const addToArray = (key: keyof ClientNoteContent, item: string) => {
    if (!item.trim()) return;
    const currentArray = (content[key] as string[]) || [];
    updateContent(key, [...currentArray, item.trim()]);
  };

  const removeFromArray = (key: keyof ClientNoteContent, index: number) => {
    const currentArray = (content[key] as string[]) || [];
    updateContent(
      key,
      currentArray.filter((_, i) => i !== index),
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-semibold text-gray-900'>
              {template ? `Create ${template.name}` : 'Create Note'}
            </h3>
            <p className='text-sm text-gray-500'>
              For {client.firstName} {client.lastName}
            </p>
          </div>
          <button onClick={onClose} className='p-2 text-gray-400 hover:text-gray-600 rounded-lg'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Form */}
        <div className='p-6 max-h-[70vh] overflow-y-auto space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Note Title</label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='Enter note title'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
              <select
                value={content.category || 'general'}
                onChange={(e) => updateContent('category', e.target.value as NoteCategory)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Confidentiality */}
          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              id='confidential'
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
            <label htmlFor='confidential' className='flex items-center gap-2 text-sm text-gray-700'>
              <Lock className='w-4 h-4' />
              Mark as confidential
            </label>
          </div>

          {/* Flexible Content Fields */}
          <div className='space-y-6'>
            {/* Key Observations */}
            <ArrayField
              label='Key Observations'
              items={content.keyObservations || []}
              onAdd={(item) => addToArray('keyObservations', item)}
              onRemove={(index) => removeFromArray('keyObservations', index)}
              placeholder='Add observation'
            />

            {/* Action Items */}
            <ArrayField
              label='Action Items'
              items={content.actionItems || []}
              onAdd={(item) => addToArray('actionItems', item)}
              onRemove={(index) => removeFromArray('actionItems', index)}
              placeholder='Add action item'
            />

            {/* Text Fields */}
            <TextAreaField
              label='Additional Context / Session Notes'
              value={content.additionalContext || ''}
              onChange={(value) => updateContent('additionalContext', value)}
              placeholder='General notes, observations, session content...'
              rows={4}
            />

            <TextAreaField
              label='Clinical Assessment'
              value={content.clinicalAssessment || ''}
              onChange={(value) => updateContent('clinicalAssessment', value)}
              placeholder='Clinical observations, mood, presentation...'
              rows={3}
            />

            <TextAreaField
              label='Treatment Plan / Goals'
              value={content.treatmentPlan || ''}
              onChange={(value) => updateContent('treatmentPlan', value)}
              placeholder='Treatment goals, interventions planned...'
              rows={3}
            />

            <TextAreaField
              label='Risk Assessment'
              value={content.riskAssessment || ''}
              onChange={(value) => updateContent('riskAssessment', value)}
              placeholder='Safety concerns, risk factors...'
              rows={3}
            />

            {/* Follow Up */}
            <ArrayField
              label='Follow Up Needed'
              items={content.followUpNeeded || []}
              onAdd={(item) => addToArray('followUpNeeded', item)}
              onRemove={(index) => removeFromArray('followUpNeeded', index)}
              placeholder='Add follow-up item'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <Save className='w-4 h-4' />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ArrayField({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <div className='space-y-2'>
        {items.map((item, index) => (
          <div key={index} className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'>
            <span className='flex-1 text-sm'>{item}</span>
            <button onClick={() => onRemove(index)} className='text-red-500 hover:text-red-700 p-1'>
              <X className='w-4 h-4' />
            </button>
          </div>
        ))}
        <div className='flex gap-2'>
          <input
            type='text'
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            className='flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            placeholder={placeholder}
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className='px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y'
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
