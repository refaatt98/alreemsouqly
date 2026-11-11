<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use imported Lovable asset pointers for store artwork and proxy `/__l5e/assets-v1/*` before Netlify's SPA fallback, so images remain portable across hosts.
- Netlify deploys the Vite frontend only; existing hosted data, uploads and push functions remain independent services, so deployment documentation must distinguish them.
