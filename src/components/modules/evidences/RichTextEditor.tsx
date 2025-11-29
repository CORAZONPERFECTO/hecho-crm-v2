
import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Palette,
  Highlighter,
  Save
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
}

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Calibri, sans-serif', label: 'Calibri' },
];

const FONT_SIZES = [
  '8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'
];

const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
  '#FF0000', '#FF6600', '#FFCC00', '#33CC00', '#0066CC',
  '#6600CC', '#CC0066', '#FFFFFF', '#FF3333', '#33FF33'
];

const HIGHLIGHT_COLORS = [
  'transparent', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF',
  '#FFB6C1', '#FFA500', '#90EE90', '#87CEEB', '#DDA0DD'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = "Ingrese la descripción..."
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFontFamily = useCallback((fontFamily: string) => {
    execCommand('fontName', fontFamily);
  }, [execCommand]);

  const handleFontSize = useCallback((fontSize: string) => {
    execCommand('fontSize', '3'); // Reset to medium size first
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = fontSize + 'px';
        try {
          range.surroundContents(span);
          onChange(editorRef.current?.innerHTML || '');
        } catch (e) {
          // If surrounding fails, apply to whole selection
          execCommand('fontSize', fontSize);
        }
      }
    }
  }, [execCommand, onChange]);

  const handleTextColor = useCallback((color: string) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  const handleHighlight = useCallback((color: string) => {
    if (color === 'transparent') {
      execCommand('removeFormat');
    } else {
      execCommand('hiliteColor', color);
    }
  }, [execCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 's':
          e.preventDefault();
          onSave?.();
          break;
      }
    }
  }, [execCommand, onSave]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target) {
      onChange(target.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');
    
    // Use HTML data if available, otherwise use plain text
    const contentToPaste = htmlData || textData;
    
    if (contentToPaste) {
      // Insert content at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        if (htmlData) {
          // Create a temporary div to parse HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlData;
          
          // Insert each node from the parsed HTML
          const fragment = document.createDocumentFragment();
          while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
          }
          range.insertNode(fragment);
        } else {
          // Insert plain text
          const textNode = document.createTextNode(textData);
          range.insertNode(textNode);
        }
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update the content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    }
  }, [onChange]);

  // Initialize content only once
  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Only update if content is significantly different and we're not actively editing
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Check if the editor is currently focused (user is actively editing)
      const isEditorFocused = document.activeElement === editorRef.current;
      
      if (!isEditorFocused) {
        // Only update if the difference is substantial (not just formatting artifacts)
        const currentText = editorRef.current.textContent || '';
        const valueText = value.replace(/<[^>]*>/g, '');
        
        if (currentText !== valueText) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
  }, [value]);

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Scrollable Toolbar */}
      <div className="border-b bg-muted/30">
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1 p-2 min-w-max">
            {/* Font Group */}
            <div className="flex items-center gap-1 px-2 py-1 border-r border-border/50">
              <Select onValueChange={handleFontFamily}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Arial" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-background border border-border shadow-lg">
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={handleFontSize}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder="12" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-background border border-border shadow-lg">
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Group */}
            <div className="flex items-center gap-1 px-2 py-1 border-r border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('underline')}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Group */}
            <div className="flex items-center gap-1 px-2 py-1 border-r border-border/50">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 z-[70]" side="bottom" align="start">
                  <div className="bg-background border border-border rounded-md shadow-lg">
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleTextColor(color)}
                          title={`Text color: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 z-[70]" side="bottom" align="start">
                  <div className="bg-background border border-border rounded-md shadow-lg">
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: color === 'transparent' ? '#ffffff' : color,
                            backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                            backgroundSize: color === 'transparent' ? '8px 8px' : 'auto',
                            backgroundPosition: color === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                          }}
                          onClick={() => handleHighlight(color)}
                          title={color === 'transparent' ? 'Remove highlight' : `Highlight: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Alignment Group */}
            <div className="flex items-center gap-1 px-2 py-1 border-r border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('justifyLeft')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('justifyCenter')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('justifyRight')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand('justifyFull')}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>

            {/* Save Button */}
            {onSave && (
              <div className="flex items-center gap-1 px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 whitespace-nowrap"
                  onClick={onSave}
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="text-xs text-muted-foreground text-center py-1 bg-muted/20">
          ← Desliza para ver más opciones →
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[120px] max-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 border-0 text-foreground overflow-y-auto resize-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '12px',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
        spellCheck={false}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          div[contenteditable="true"]:empty::before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
          }
          div[contenteditable="true"]:focus {
            outline: none;
          }
        `
      }} />
    </div>
  );
};
