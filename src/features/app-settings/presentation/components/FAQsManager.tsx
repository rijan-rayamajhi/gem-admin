'use client';

import { FAQ } from '../../domain/entities/AppSettings';
import { useState } from 'react';

interface FAQsManagerProps {
  faqs?: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

export default function FAQsManager({ faqs, onChange }: FAQsManagerProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  // Ensure faqs is always an array
  const safeFAQs = faqs || [];

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
    };
    onChange([...safeFAQs, newFAQ]);
    setExpandedFAQ(newFAQ.id);
  };

  const removeFAQ = (id: string) => {
    onChange(safeFAQs.filter(faq => faq.id !== id));
    if (expandedFAQ === id) {
      setExpandedFAQ(null);
    }
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    onChange(
      safeFAQs.map(faq =>
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <label className="block text-sm font-medium text-card-foreground">
          FAQs
        </label>
        <button
          type="button"
          onClick={addFAQ}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto"
        >
          + Add FAQ
        </button>
      </div>

      {safeFAQs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p>No FAQs added yet.</p>
          <p className="text-sm">Click &quot;Add FAQ&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeFAQs.map((faq, index) => (
            <div
              key={faq.id}
              className="border border-border rounded-lg p-4 bg-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                <span className="text-sm font-medium text-muted-foreground">
                  FAQ #{index + 1}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(faq.id)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {expandedFAQ === faq.id ? (
                      <>
                        <span>−</span> <span className="hidden sm:inline">Collapse</span>
                      </>
                    ) : (
                      <>
                        <span>+</span> <span className="hidden sm:inline">Expand</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFAQ(faq.id)}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {expandedFAQ === faq.id && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter the question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter the answer..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {expandedFAQ !== faq.id && (
                <div className="text-sm text-muted-foreground">
                  {faq.question ? (
                    <div className="space-y-1">
                      <div className="break-words">
                        <strong>Q:</strong> {faq.question}
                      </div>
                      {faq.answer && (
                        <div className="break-words">
                          <strong>A:</strong> {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>Click &quot;Expand&quot; to edit this FAQ</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
