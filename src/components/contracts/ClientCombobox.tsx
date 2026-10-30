"use client";

import { useId, useState } from "react";
import type { Client } from "@/lib/types";

const MAX_SUGGESTIONS = 8;

// Compara sem acentos e sem diferenciar maiúsculas: "joao" encontra "João".
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

interface ClientComboboxProps {
  value: string;
  clients: Client[];
  onChange: (text: string) => void;
  onSelect: (client: Client) => void;
  className?: string;
}

// Campo de texto livre com sugestões de clientes cadastrados. Digitar só altera
// o nome; escolher uma sugestão chama onSelect para preencher os demais dados.
export function ClientCombobox({
  value,
  clients,
  onChange,
  onSelect,
  className = "",
}: ClientComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = normalize(value.trim());
  const suggestions = clients
    .filter((client) =>
      [client.name, client.email, client.company ?? ""].some((field) =>
        normalize(field).includes(query),
      ),
    )
    .slice(0, MAX_SUGGESTIONS);
  const showList = open && suggestions.length > 0;

  function choose(client: Client) {
    onSelect(client);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && showList && activeIndex >= 0) {
      e.preventDefault();
      choose(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        value={value}
        placeholder="Digite para buscar um cliente cadastrado"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((client, index) => (
            <li
              key={client.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // mouseDown (e não click) para escolher antes do blur fechar a lista.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(client);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex ? "bg-indigo-50" : ""
              }`}
            >
              <span className="font-medium text-slate-900">{client.name}</span>
              {client.company && (
                <span className="text-slate-500"> · {client.company}</span>
              )}
              <span className="block text-xs text-slate-500">
                {client.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
