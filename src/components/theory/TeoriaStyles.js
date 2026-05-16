export function TeoriaGlobalStyles() {
  return (
    <style jsx global>{`
      .teoria-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell {
        min-height: 100svh;
        max-width: 1100px;
        margin: 0 auto;
        padding: clamp(20px, 4vw, 32px) clamp(14px, 3vw, 20px);
      }
      .header h1 {
        font-size: 44px;
        margin: 0 0 6px;
        color: var(--text);
      }
      .header p {
        margin: 0;
        color: #666;
      }
      .header--mascot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 20px 32px;
        margin-bottom: 8px;
      }
      .header__copy {
        flex: 1 1 240px;
        min-width: 0;
      }
      .header__mascot {
        flex: 0 0 auto;
        line-height: 0;
        filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.12));
      }
      .breadcrumb {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        font-size: 14px;
        color: #666;
      }
      .breadcrumb a {
        color: #0070f3;
        text-decoration: none;
      }
      .breadcrumb a:hover {
        text-decoration: underline;
      }
      .area-grid {
        list-style: none;
        margin: 28px 0 0;
        padding: 0;
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .area-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 980px) {
        .area-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .area-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 100%;
        border: 1px solid #eaeaea;
        border-radius: 20px;
        background: var(--card);
        padding: 22px;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        text-decoration: none;
        color: inherit;
      }
      .area-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
        border-color: #0070f3;
        text-decoration: none;
      }
      .area-card:hover .area-card__desc,
      .area-card:hover .area-card__meta {
        text-decoration: none;
      }
      .area-card__head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .area-card__icon {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-size: 20px;
        font-weight: 700;
        color: white;
        transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
      }
      .area-card__title {
        font-size: 22px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text);
        transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), font-size 0.28s ease;
        transform-origin: left center;
      }
      .area-card:hover .area-card__title {
        font-size: 26px;
        transform: scale(1.06);
      }
      .area-card:hover .area-card__icon {
        transform: scale(1.08);
      }
      .area-card__desc {
        font-size: 14px;
        color: #666;
        line-height: 1.45;
        flex: 1;
      }
      .area-card__meta {
        font-size: 13px;
        color: #0070f3;
        font-weight: 600;
      }
      .theory-section__header-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        font-size: 1.5rem;
        line-height: 1;
        flex-shrink: 0;
      }
      .theory-section__header h3 {
        color: #fff !important;
      }
      .toolbar {
        position: sticky;
        top: 16px;
        z-index: 5;
        margin: 22px 0 18px;
        padding: 14px;
        border: 1px solid #eaeaea;
        border-radius: 16px;
        background: var(--card);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        padding: 8px 12px;
        border-radius: 9999px;
        border: 1px solid #eaeaea;
        background: var(--card);
        color: var(--text);
        cursor: pointer;
        transition: 0.2s;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .chip:hover {
        transform: translateY(-1px);
        border-color: #0070f3;
        background: #b0d6fa;
      }
      .chip--active {
        border-color: transparent;
        color: white;
      }
      .chip--ghost {
        background: transparent;
      }
      .search {
        position: relative;
        margin-top: 12px;
      }
      .search input {
        width: 100%;
        padding: 12px 36px 12px 12px;
        border-radius: 12px;
        border: 1px solid #eaeaea;
        background: white;
        color: var(--text);
        outline: none;
      }
      .search input:focus {
        box-shadow: 0 0 0 6px rgba(0, 112, 243, 0.35);
        border-color: #0070f3;
      }
      .search__icon {
        position: absolute;
        right: 10px;
        top: 50%;
        translate: 0 -50%;
        opacity: 0.6;
      }
      .meta {
        margin-top: 10px;
        font-size: 12px;
        color: #666;
      }
      .level-info {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #eaeaea;
      }
      .level-info h4 {
        margin: 0 0 12px;
        color: var(--text);
        font-size: 14px;
        font-weight: 600;
      }
      .level-cards {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .level-card {
        border: 2px solid;
        border-radius: 12px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .level-header {
        color: white;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
      .level-code {
        font-size: 14px;
      }
      .level-name {
        font-size: 12px;
        opacity: 0.9;
      }
      .level-content {
        padding: 12px;
      }
      .level-description {
        margin: 0 0 8px;
        font-size: 12px;
        color: #4a5568;
        line-height: 1.4;
      }
      .level-skills {
        margin: 0;
        font-size: 11px;
        color: #666;
        line-height: 1.3;
      }
      .level-skills strong {
        color: #4a5568;
      }
      .topic-grid {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .topic-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 980px) {
        .topic-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .card {
        display: block;
        height: 100%;
        border: 1px solid #eaeaea;
        border-radius: 18px;
        background: var(--card);
        padding: 18px;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        text-decoration: none;
        color: inherit;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
        border-color: #0070f3;
        background: #b0d6fa;
      }
      .card:focus {
        outline: none;
        box-shadow: 0 0 0 6px rgba(0, 112, 243, 0.35);
      }
      .card__title {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--text);
      }
      .card__levels {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pill {
        font-size: 11px;
        border: 1px solid #eaeaea;
        border-radius: 9999px;
        padding: 4px 8px;
        background: white;
        color: #666;
      }
      .empty {
        display: grid;
        place-items: center;
        text-align: center;
        padding: 48px;
        border: 1px dashed #eaeaea;
        border-radius: 16px;
        background: var(--card);
      }
      .empty__mascot {
        line-height: 0;
        margin-bottom: 12px;
        opacity: 0.95;
      }
      .btn {
        margin-top: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        background: #0070f3;
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(0, 112, 243, 0.35);
        text-decoration: none;
        display: inline-block;
      }
    `}</style>
  );
}
