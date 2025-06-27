'use client';

import {
  X,
  Plus,
  GripVertical,
  Type,
  FileText,
  ListChecks,
  CheckCircle2,
  Calendar,
  Mail,
  Hash,
  Eye,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { COLORS } from '@/src/styles/colors';

import type { FormField, IntakeForm } from '../../types/forms';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type, description: 'Single line text input' },
  { type: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
  { type: 'select', label: 'Dropdown', icon: ListChecks, description: 'Select from options' },
  { type: 'radio', label: 'Multiple Choice', icon: CheckCircle2, description: 'Select one option' },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckCircle2,
    description: 'Select multiple options',
  },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
] as const;

export interface DragState {
  draggedField: { fieldId: string; index: number } | null;
  dragOverIndex: number | null;
}

// Header Component
interface FormBuilderHeaderProps {
  editingForm?: IntakeForm;
  form: Partial<IntakeForm>;
  previewMode: boolean;
  onPreviewToggle: () => void;
  onClose: () => void;
}

export function FormBuilderHeader({
  editingForm,
  form,
  previewMode,
  onPreviewToggle,
  onClose,
}: FormBuilderHeaderProps) {
  return (
    <div className='flex items-center justify-between p-6 border-b border-gray-200'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>
          {editingForm ? 'Edit Form' : 'Create New Form'}
        </h2>
        <p className='text-gray-600 mt-1'>Build custom intake forms for your clients</p>
        {form.fields && form.fields.length > 1 && (
          <p className='text-sm text-purple-600 mt-1'>
            💡 Tip: Drag the grip icon to reorder fields
          </p>
        )}
      </div>
      <div className='flex items-center gap-3'>
        <button
          onClick={onPreviewToggle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            previewMode
              ? `${COLORS.WARM_PURPLE.bg} text-white`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className='w-4 h-4' />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </button>
        <button
          onClick={onClose}
          className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-6 h-6' />
        </button>
      </div>
    </div>
  );
}

// Field Types Sidebar Component
interface FieldTypesSidebarProps {
  onAddField: (type: FormField['type']) => void;
}

export function FieldTypesSidebar({ onAddField }: FieldTypesSidebarProps) {
  return (
    <div className='w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>Field Types</h3>
      <div className='space-y-3'>
        {FIELD_TYPES.map((fieldType) => (
          <button
            key={fieldType.type}
            onClick={() => onAddField(fieldType.type)}
            className='w-full p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group'
          >
            <div className='flex items-center gap-3 mb-2'>
              <fieldType.icon className='w-5 h-5 text-purple-600' />
              <span className='font-medium text-gray-900'>{fieldType.label}</span>
            </div>
            <p className='text-sm text-gray-500'>{fieldType.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Form Builder Main Component
interface FormBuilderMainProps {
  form: Partial<IntakeForm>;
  onFormUpdate: React.Dispatch<React.SetStateAction<Partial<IntakeForm>>>;
  dragState: DragState;
  onDragStateChange: (state: DragState) => void;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

export function FormBuilderMain({
  form,
  onFormUpdate,
  dragState,
  onDragStateChange,
  onUpdateField,
  onDeleteField,
  onMoveField,
}: FormBuilderMainProps) {
  const { draggedField, dragOverIndex } = dragState;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fieldId: string, index: number) => {
    onDragStateChange({
      draggedField: { fieldId, index },
      dragOverIndex: null,
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');

    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    e.dataTransfer.setDragImage(dragImage, 20, 20);
  };

  const handleDragEnd = () => {
    onDragStateChange({
      draggedField: null,
      dragOverIndex: null,
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedField && draggedField.index !== index) {
      onDragStateChange({
        draggedField,
        dragOverIndex: index,
      });
    }
  };

  const handleDragLeave = () => {
    onDragStateChange({
      draggedField,
      dragOverIndex: null,
    });
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedField && draggedField.index !== dropIndex) {
      onMoveField(draggedField.index, dropIndex);
      toast.success('Field reordered successfully!');
    }

    onDragStateChange({
      draggedField: null,
      dragOverIndex: null,
    });
  };

  const addOption = (fieldId: string) => {
    onUpdateField(fieldId, {
      options: [...(form.fields?.find((f) => f.id === fieldId)?.options || []), 'New option'],
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields?.find((f) => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      onUpdateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields?.find((f) => f.id === fieldId);
    if (field?.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      onUpdateField(fieldId, { options: newOptions });
    }
  };

  return (
    <div className='flex-1 p-6 overflow-y-auto'>
      <div className='max-w-2xl mx-auto'>
        {/* Form Settings */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Form Settings</h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Form Title *</label>
              <input
                type='text'
                value={form.title || ''}
                onChange={(e) => onFormUpdate((prev) => ({ ...prev, title: e.target.value }))}
                placeholder='Enter form title...'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description (Optional)
              </label>
              <textarea
                value={form.description || ''}
                onChange={(e) => onFormUpdate((prev) => ({ ...prev, description: e.target.value }))}
                placeholder='Describe the purpose of this form...'
                rows={3}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none'
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className='space-y-4'>
          {form.fields?.map((field, index) => (
            <div
              key={field.id}
              className={`relative transition-all duration-200 ${
                dragOverIndex === index && draggedField?.index !== index
                  ? 'border-t-4 border-purple-500 pt-4'
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <FieldEditor
                field={field}
                index={index}
                onUpdate={(updates) => onUpdateField(field.id, updates)}
                onDelete={() => onDeleteField(field.id)}
                onMove={onMoveField}
                onAddOption={() => addOption(field.id)}
                onUpdateOption={(optionIndex, value) => updateOption(field.id, optionIndex, value)}
                onDeleteOption={(optionIndex) => deleteOption(field.id, optionIndex)}
                canMoveUp={index > 0}
                canMoveDown={index < (form.fields?.length || 0) - 1}
                isDragging={draggedField?.fieldId === field.id}
                onDragStart={(e) => handleDragStart(e, field.id, index)}
                onDragEnd={handleDragEnd}
              />

              {/* Drop zone indicator at the bottom of the last field */}
              {index === (form.fields?.length || 0) - 1 &&
                draggedField &&
                draggedField.index !== index + 1 && (
                  <div
                    className={`mt-4 transition-all duration-200 ${
                      dragOverIndex === index + 1
                        ? 'border-t-4 border-purple-500 pt-2'
                        : 'border-t-2 border-dashed border-gray-300 pt-2 opacity-50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, index + 1)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index + 1)}
                  >
                    <div className='text-center text-sm text-gray-500 py-2'>
                      Drop here to add at the end
                    </div>
                  </div>
                )}
            </div>
          ))}

          {!form.fields?.length && (
            <div className='text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300'>
              <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No fields added yet</h3>
              <p className='text-gray-500'>
                Start building your form by adding fields from the sidebar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Preview Section Component
interface FormPreviewSectionProps {
  form: Partial<IntakeForm>;
}

export function FormPreviewSection({ form }: FormPreviewSectionProps) {
  return (
    <div className='flex-1 p-6 overflow-y-auto bg-gray-50'>
      <div className='max-w-2xl mx-auto'>
        <FormPreview form={form} />
      </div>
    </div>
  );
}

// Form Builder Footer Component
interface FormBuilderFooterProps {
  saving: boolean;
  onCancel: () => void;
  onSave: (status?: 'draft' | 'active') => void;
}

export function FormBuilderFooter({ saving, onCancel, onSave }: FormBuilderFooterProps) {
  return (
    <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
      <button
        onClick={onCancel}
        className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium'
      >
        Cancel
      </button>
      <div className='flex items-center gap-3'>
        <button
          onClick={() => onSave('draft')}
          disabled={saving}
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50'
        >
          <Save className='w-4 h-4' />
          Save as Draft
        </button>
        <button
          onClick={() => onSave('active')}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors font-medium disabled:opacity-50`}
        >
          <Save className='w-4 h-4' />
          {saving ? 'Saving...' : 'Save & Activate'}
        </button>
      </div>
    </div>
  );
}

// Field Editor Component
interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onDeleteOption: (optionIndex: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function FieldEditor({
  field,
  index,
  onUpdate,
  onDelete,
  onMove,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  canMoveUp,
  canMoveDown,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: FieldEditorProps) {
  const fieldTypeInfo = FIELD_TYPES.find((t) => t.type === field.type);
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 ${
        isDragging
          ? 'opacity-50 rotate-1 scale-105 shadow-lg border-purple-300 bg-purple-50'
          : 'hover:shadow-md hover:border-gray-300'
      } cursor-move`}
    >
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex items-center gap-2'>
          <GripVertical
            className={`w-5 h-5 ${isDragging ? 'text-purple-600' : 'text-gray-400'} cursor-grab active:cursor-grabbing`}
          />
          <span className='text-xs text-gray-500 font-medium'>#{index + 1}</span>
        </div>
        {fieldTypeInfo && <fieldTypeInfo.icon className='w-5 h-5 text-purple-600' />}
        <span className='font-medium text-gray-900'>{fieldTypeInfo?.label}</span>
        <div className='flex-1' />

        {/* Quick move buttons for better UX */}
        <div className='flex items-center gap-1'>
          {canMoveUp && (
            <button
              onClick={() => onMove(index, index - 1)}
              className='p-1 text-gray-400 hover:text-purple-600 transition-colors'
              title='Move up'
            >
              <ArrowUp className='w-4 h-4' />
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={() => onMove(index, index + 1)}
              className='p-1 text-gray-400 hover:text-purple-600 transition-colors'
              title='Move down'
            >
              <ArrowDown className='w-4 h-4' />
            </button>
          )}
          <button
            onClick={onDelete}
            className='p-1 text-red-400 hover:text-red-600 transition-colors'
            title='Delete field'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Label *</label>
          <input
            type='text'
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Placeholder</label>
          <input
            type='text'
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
          />
        </div>
      </div>

      {hasOptions && (
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Options</label>
          <div className='space-y-2'>
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className='flex items-center gap-2'>
                <input
                  type='text'
                  value={option}
                  onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
                  className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
                />
                <button
                  onClick={() => onDeleteOption(optionIndex)}
                  className='p-1 text-red-400 hover:text-red-600 transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            ))}
            <button
              onClick={onAddOption}
              className='inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors'
            >
              <Plus className='w-3 h-3' />
              Add Option
            </button>
          </div>
        </div>
      )}

      <div className='flex items-center gap-4'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
          />
          <span className='text-sm text-gray-700'>Required field</span>
        </label>
      </div>
    </div>
  );
}

// Form Preview Component
interface FormPreviewProps {
  form: Partial<IntakeForm>;
}

function FormPreview({ form }: FormPreviewProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{form.title || 'Untitled Form'}</h1>
        {form.description && <p className='text-gray-600 leading-relaxed'>{form.description}</p>}
      </div>

      <div className='space-y-6'>
        {form.fields?.map((field) => <PreviewField key={field.id} field={field} />)}

        {!form.fields?.length && (
          <div className='text-center py-8 text-gray-500'>No fields to preview yet</div>
        )}
      </div>

      <div className='mt-8 pt-6 border-t border-gray-200'>
        <button
          disabled
          className={`w-full py-3 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg font-medium opacity-50 cursor-not-allowed`}
        >
          Submit Form (Preview)
        </button>
      </div>
    </div>
  );
}

// Preview Field Component
interface PreviewFieldProps {
  field: FormField;
}

function PreviewField({ field }: PreviewFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            disabled
            className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none'
          />
        );
      case 'select':
        return (
          <select
            disabled
            className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'
          >
            <option>Choose an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className='space-y-3'>
            {field.options?.map((option, index) => (
              <label key={index} className='flex items-center gap-3'>
                <input
                  type='radio'
                  name={field.id}
                  disabled
                  className='border-gray-300 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className='space-y-3'>
            {field.options?.map((option, index) => (
              <label key={index} className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  disabled
                  className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type='date'
            disabled
            className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'
          />
        );
      default:
        return <div className='text-gray-400'>Unsupported field type</div>;
    }
  };

  return (
    <div>
      <label className='block text-sm font-medium text-gray-900 mb-2'>
        {field.label}
        {field.required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {renderField()}
    </div>
  );
}
