import React, { useState } from 'react';
import { Category, Subcategory, Division } from '../../types';
import { DIVISION_LIST, generateDefaultSubcategoriesForCategory } from '../../data/initialCategories';
import { 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  addSubcategoryToCategory, 
  updateSubcategory, 
  deleteSubcategory, 
  autoGenerateSubcategoriesForCat,
  resetCategoriesToDefault
} from '../../utils/store';
import { 
  Plus, 
  FolderTree, 
  Tag, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  RotateCcw,
  Search,
  AlertCircle
} from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
  onSelectCategoryFilter?: (catName: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ 
  categories, 
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<Division | 'ALL'>('ALL');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDivision, setCatDivision] = useState<Division>('PHARMACEUTICALS & HEALTHCARE');
  const [catDescription, setCatDescription] = useState('');
  const [autoGenSubsOnCreate, setAutoGenSubsOnCreate] = useState(true);

  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');

  // Confirmation Alert
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categories.forEach(c => { allExpanded[c.id] = true; });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Open Create Category
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDivision('PHARMACEUTICALS & HEALTHCARE');
    setCatDescription('');
    setAutoGenSubsOnCreate(true);
    setIsCatModalOpen(true);
  };

  // Open Edit Category
  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCatName(category.name);
    setCatDivision(category.division || 'PHARMACEUTICALS & HEALTHCARE');
    setCatDescription(category.description || '');
    setAutoGenSubsOnCreate(false);
    setIsCatModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        division: catDivision,
        description: catDescription.trim()
      });
      showNotification(`Category "${catName}" updated successfully!`);
    } else {
      const generatedSubs = autoGenSubsOnCreate
        ? generateDefaultSubcategoriesForCategory(catName, `cat-${Date.now()}`)
        : [];

      addCategory({
        name: catName.trim(),
        division: catDivision,
        description: catDescription.trim(),
        subcategories: generatedSubs
      });
      showNotification(`Category "${catName}" created with ${generatedSubs.length} subcategories!`);
    }

    setIsCatModalOpen(false);
    onRefresh();
  };

  // Delete Category
  const handleDeleteCategory = (cat: Category) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}" and all its ${cat.subcategories.length} subcategories?`)) {
      deleteCategory(cat.id);
      showNotification(`Category "${cat.name}" deleted.`);
      onRefresh();
    }
  };

  // Open Create Subcategory
  const handleOpenCreateSubcategory = (categoryId: string) => {
    setSubCategoryId(categoryId);
    setEditingSubcategory(null);
    setSubName('');
    setSubDescription('');
    setIsSubModalOpen(true);
  };

  // Open Edit Subcategory
  const handleOpenEditSubcategory = (categoryId: string, sub: Subcategory) => {
    setSubCategoryId(categoryId);
    setEditingSubcategory(sub);
    setSubName(sub.name);
    setSubDescription(sub.description || '');
    setIsSubModalOpen(true);
  };

  // Save Subcategory
  const handleSaveSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCategoryId) return;

    if (editingSubcategory) {
      updateSubcategory(subCategoryId, editingSubcategory.id, {
        name: subName.trim(),
        description: subDescription.trim()
      });
      showNotification(`Subcategory "${subName}" updated.`);
    } else {
      addSubcategoryToCategory(subCategoryId, subName.trim(), subDescription.trim());
      showNotification(`Subcategory "${subName}" created.`);
    }

    setIsSubModalOpen(false);
    onRefresh();
  };

  // Delete Subcategory
  const handleDeleteSubcategory = (categoryId: string, sub: Subcategory) => {
    if (window.confirm(`Delete subcategory "${sub.name}"?`)) {
      deleteSubcategory(categoryId, sub.id);
      showNotification(`Subcategory "${sub.name}" deleted.`);
      onRefresh();
    }
  };

  // Auto-generate subcategories for specific category
  const handleAutoGenerateForCategory = (categoryId: string) => {
    const generated = autoGenerateSubcategoriesForCat(categoryId);
    showNotification(`Generated ${generated.length} dynamic subcategories automatically!`);
    // Ensure expanded
    setExpandedCategories(prev => ({ ...prev, [categoryId]: true }));
    onRefresh();
  };

  // Reset to default hierarchy
  const handleResetHierarchy = () => {
    if (window.confirm('Reset category hierarchy to standard ACI Bangladesh corporate structure? Custom added categories will be reset.')) {
      resetCategoriesToDefault();
      showNotification('Category & subcategory hierarchy reset to standard ACI structure.');
      onRefresh();
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cat.subcategories.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDivision = selectedDivisionFilter === 'ALL' || cat.division === selectedDivisionFilter;
    return matchesSearch && matchesDivision;
  });

  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

  return (
    <div className="space-y-6" id="admin-categories-container">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-red-500/30 fixed bottom-6 right-6 z-50 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Control Header & Stats */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Category & Subcategory Hierarchy</h2>
          </div>
          <p className="text-xs text-slate-500">
            Define dynamic categories and subcategories. Products added in the dashboard immediately link to these taxonomies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetHierarchy}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset standard ACI divisions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ACI Structure</span>
          </button>

          <button
            onClick={handleOpenCreateCategory}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Search, Division Filter & Quick Tree Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search category or subcategory name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Collapse All
            </button>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {filteredCategories.length} Categories • {totalSubcategories} Subcategories
            </div>
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Division:</span>
          <button
            onClick={() => setSelectedDivisionFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedDivisionFilter === 'ALL'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Divisions
          </button>
          {DIVISION_LIST.map(div => (
            <button
              key={div}
              onClick={() => setSelectedDivisionFilter(div)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedDivisionFilter === div
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {div.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Hierarchy Display */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No categories found matching your search</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or create a new category.</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.id] !== false; // default expanded

            return (
              <div 
                key={category.id} 
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Category Header Bar */}
                <div className="p-4 sm:p-4.5 bg-gradient-to-r from-slate-50/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 hover:bg-slate-200/70 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse category" : "Expand category"}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                          {category.name}
                        </h3>
                        {category.division && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                            {category.division}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {category.id}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Category */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleAutoGenerateForCategory(category.id)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      title="Automatically create 3 standardized subcategories for this category"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Auto-Generate Subcategories</span>
                    </button>

                    <button
                      onClick={() => handleOpenCreateSubcategory(category.id)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subcategory</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditCategory(category)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Container */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/50">
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {category.subcategories.map(sub => (
                          <div
                            key={sub.id}
                            className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <Tag className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                                    {sub.name}
                                  </h4>
                                  {sub.description && (
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                      {sub.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Subcategory Edit / Delete buttons */}
                              <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditSubcategory(category.id, sub)}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                  title="Edit Subcategory"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(category.id, sub)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>{sub.id}</span>
                              <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-sans font-medium">Subcategory</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                        <p className="text-xs text-slate-500 font-medium">No subcategories created yet under {category.name}.</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAutoGenerateForCategory(category.id)}
                            className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Auto-Generate 3 Subcategories
                          </button>
                          <button
                            onClick={() => handleOpenCreateSubcategory(category.id)}
                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Manually
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Add / Edit Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {editingCategory ? 'Edit Product Category' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anti-Diabetics, Dairy & Cow Ghee, Hybrid Seeds"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Business Division <span className="text-red-500">*</span>
                </label>
                <select
                  value={catDivision}
                  onChange={e => setCatDivision(e.target.value as Division)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                >
                  {DIVISION_LIST.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of product types in this category..."
                  value={catDescription}
                  onChange={e => setCatDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {!editingCategory && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoGenSubs"
                    checked={autoGenSubsOnCreate}
                    onChange={e => setAutoGenSubsOnCreate(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="autoGenSubs" className="text-xs text-amber-900 leading-snug cursor-pointer">
                    <span className="font-bold">Automatically generate standard subcategories</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      The system will automatically analyze your category name and create 3 contextual subcategories.
                    </p>
                  </label>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Subcategory */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
              </div>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parent Category
                </label>
                <select
                  value={subCategoryId}
                  onChange={e => setSubCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.division})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subcategory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inhaled Corticosteroids, Normal Saline"
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description or classification of this subcategory..."
                  value={subDescription}
                  onChange={e => setSubDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
