"use client";

import * as React from "react";

interface Playlist {
  name: string;
  id: string;
  emoji: string;
}

const FOCUS_PLAYLISTS: Playlist[] = [
  { name: "Deep Focus", id: "37i9dQZF1DWZeKCadgRdKQ", emoji: "🎧" },
  { name: "Peaceful Piano", id: "37i9dQZF1DX4sWSpwq3LiO", emoji: "🎹" },
  { name: "Lofi Beats", id: "37i9dQZF1DWWQRwui0ExPn", emoji: "🎵" },
  { name: "Brain Food", id: "37i9dQZF1DWXLeA8Omikj7", emoji: "🧠" },
  { name: "Ambient Chill", id: "37i9dQZF1DX3Ogo9pFvBkY", emoji: "🌙" },
];

export function SpotifyPlayer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState(FOCUS_PLAYLISTS[0]);

  return (
    <div className="fixed left-4 bottom-4 z-50">
      {isOpen ? (
        <div className="bg-card border rounded-lg shadow-2xl p-3 mb-2 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center mb-3 gap-2">
            <select
              value={selectedPlaylist.id}
              onChange={(e) => {
                const playlist = FOCUS_PLAYLISTS.find((p) => p.id === e.target.value);
                if (playlist) setSelectedPlaylist(playlist);
              }}
              className="text-xs sm:text-sm px-2 py-1.5 rounded-md border bg-background hover:bg-accent cursor-pointer flex-1 min-w-0"
            >
              {FOCUS_PLAYLISTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm hover:text-red-500 transition-colors px-2 py-1 hover:bg-accent rounded-md flex-shrink-0"
              title="Close"
            >
              ✕
            </button>
          </div>
          <iframe
            style={{ borderRadius: "8px" }}
            src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
            width="280"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Spotify: ${selectedPlaylist.name}`}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            🎵 Free Focus Music
          </p>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 group"
          title="Open Focus Music Player"
        >
          <span className="text-xl sm:text-2xl group-hover:animate-pulse">🎵</span>
        </button>
      )}
    </div>
  );
}
