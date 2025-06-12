'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { formsStateSignal, formsActions } from '../../state/formsState';
import type { FormField, IntakeForm } from '../../types/forms';

import {
  DragState,
  FormBuilderHeader,
  FieldTypesSidebar,
  FormBuilderMain,
  FormPreviewSection,
  FormBuilderFooter,
} from './FormBuilderComponents';

export function FormBuilder() {
  const formBuilderState = formsStateSignal.value.formBuilder;
  const [form, setForm] = useState<Partial<IntakeForm>>({
    title: '',
    description: '',
    fields: [],
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    draggedField: null,
    dragOverIndex: null,
  });

  useEffect(() => {
    if (formBuilderState.editingForm) {
      setForm(formBuilderState.editingForm);
    } else {
      setForm({
        title: '',
        description: '',
        fields: [],
        status: 'draft',
      });
    }
  }, [formBuilderState.editingForm]);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      options:
        type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : undefined,
    };

    setForm((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));

    if (!form.fields?.length) {
      toast.success('Great! You can now drag fields to reorder them as needed.');
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields:
        prev.fields?.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)) ||
        [],
    }));
  };

  const deleteField = (fieldId: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields?.filter((field) => field.id !== fieldId) || [],
    }));
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setForm((prev) => {
      const fields = [...(prev.fields || [])];
      const [movedField] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, movedField);
      return { ...prev, fields };
    });
  };

  const handleSave = async (status: 'draft' | 'active' = 'draft') => {
    if (!form.title?.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    if (!form.fields?.length) {
      toast.error('Please add at least one field to the form');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        ...form,
        status,
        therapistId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as IntakeForm;

      if (formBuilderState.editingForm) {
        formsActions.updateForm(formBuilderState.editingForm.id, formData);
        toast.success('Form updated successfully');
      } else {
        formData.id = `form_${Date.now()}`;
        formsActions.addForm(formData);
        toast.success('Form created successfully');
      }

      formsActions.closeFormBuilder();
    } catch (error) {
      toast.error('Failed to save form');
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!formBuilderState.isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col'>
        <FormBuilderHeader
          editingForm={formBuilderState.editingForm}
          form={form}
          previewMode={previewMode}
          onPreviewToggle={() => setPreviewMode(!previewMode)}
          onClose={formsActions.closeFormBuilder}
        />

        <div className='flex-1 flex overflow-hidden'>
          {!previewMode ? (
            <>
              <FieldTypesSidebar onAddField={addField} />
              <FormBuilderMain
                form={form}
                onFormUpdate={setForm}
                dragState={dragState}
                onDragStateChange={setDragState}
                onUpdateField={updateField}
                onDeleteField={deleteField}
                onMoveField={moveField}
              />
            </>
          ) : (
            <FormPreviewSection form={form} />
          )}
        </div>

        <FormBuilderFooter
          saving={saving}
          onCancel={formsActions.closeFormBuilder}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
