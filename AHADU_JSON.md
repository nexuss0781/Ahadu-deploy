# `ahadu.json` specification

`ahadu.json` is Ahadu Deploy’s project manifest. It is intentionally provider-aware but portable: it describes how a project is detected, installed, built, started, and prepared for Wasmer Edge.

## Complete example

```json
{
  "$schema": "https://ahadu-deploy.dev/schema/ahadu.json",
  "version": 1,
  "name": "field-notes",
  "framework": "node",
  "source": { "directory": "." },
  "entry": {
    "file": "server.js",
    "command": "node server.js",
    "port": 80,
    "runner": "wasix"
  },
  "commands": {
    "install": "npm ci",
    "build": "npm run build"
  },
  "environment": { "NODE_ENV": "production" },
  "deploy": {
    "provider": "wasmer",
    "region": "auto",
    "appName": "field-notes"
  }
}
```

## Fields

| Field | Required | Allowed values / type | Meaning |
|---|---:|---|---|
| `$schema` | No | URL string | Editor schema reference. |
| `version` | Yes | Integer; currently `1` | Manifest format version. |
| `name` | Yes | Lowercase slug | Application name used for generated deployment metadata. |
| `framework` | Yes | `node`, `php`, `laravel`, `python` | Detected or user-confirmed framework. |
| `source.directory` | Yes | Relative path | Project root to inspect; normally `.`. |
| `entry.file` | Yes | Relative path | Primary application entry file. |
| `entry.command` | Yes | Shell command | Command used to start the application. |
| `entry.port` | Yes | Integer | HTTP port exposed by the application. |
| `entry.runner` | Yes | `wasix` or `wcgi` | Wasmer execution runner. |
| `commands.install` | Yes | Shell command | Dependency installation command. |
| `commands.build` | Yes | Shell command | Build or preparation command. |
| `environment` | No | Key/value object | Non-secret runtime variables. Secrets must not be committed. |
| `deploy.provider` | Yes | `wasmer` | Deployment target for the generated recipe. |
| `deploy.region` | Yes | `auto` or region identifier | Target region preference. |
| `deploy.appName` | Yes | Lowercase slug | Wasmer application name. |

## Framework defaults

| Framework | Evidence | Entry point | Start command | Install | Build | Runner |
|---|---|---|---|---|---|---|
| Node.js | `package.json`, `server.js`, `server.ts`, `index.js`, or `index.ts` | First matching server/index file | `node server.js` | `npm ci` | `npm run build` | WASIX |
| PHP | `composer.json`, `public/index.php`, or `index.php` | `public/index.php` or `index.php` | `php -S 0.0.0.0:80 -t public` | `composer install --no-dev` | `composer dump-autoload --optimize` | WCGI |
| Laravel | `artisan`, `composer.json`, `routes/web.php`, and `public/index.php` | `public/index.php` | `php artisan serve --host 0.0.0.0 --port 80` | `composer install --no-dev` | `php artisan config:cache` | WCGI |
| Python | `requirements.txt`, `pyproject.toml`, `app.py`, `main.py`, or `wsgi.py` | First matching Python entry file | `gunicorn app:app --bind 0.0.0.0:80` | `pip install -r requirements.txt` | `python -m compileall .` | WASIX |

Detection is deterministic. Ahadu Deploy assigns evidence weights to exact filenames and selects the highest-scoring framework. When scores tie, the user must choose the framework manually before preparing deployment.

## Ahadu Deploy arguments

The core interface maps to the following command model. These commands describe the intended CLI contract; GitHub OAuth and repository authorization are deliberately not part of this release.

```text
ahadu deploy inspect <source>
ahadu deploy detect <source>
ahadu deploy prepare <source> [options]
ahadu deploy manifest <source> [options]
ahadu deploy validate <ahadu.json>
```

| Argument | Meaning |
|---|---|
| `<source>` | Public repository URL, local directory path, or `.zip` archive. |
| `--framework <name>` | Override detection with `node`, `php`, `laravel`, or `python`. |
| `--entry <path>` | Override the generated entry file. |
| `--start <command>` | Override the start command. |
| `--install <command>` | Override dependency installation. |
| `--build <command>` | Override the build command. |
| `--port <number>` | Override the exposed HTTP port. |
| `--runner <name>` | Override the runner with `wasix` or `wcgi`. |
| `--name <slug>` | Set the generated application name. |
| `--region <name>` | Set the target Wasmer region or `auto`. |
| `--output <path>` | Write the generated `ahadu.json` or `app.yaml` to a file. |
| `--format <name>` | Select `ahadu-json`, `wasmer-yaml`, or `summary`. |
| `--strict` | Fail if required evidence or files are missing. |
| `--dry-run` | Generate and validate configuration without deploying. |

## Safety boundaries in this release

Local folder and ZIP inspection runs in the browser and does not upload project contents to a backend in this static MVP. The interface does not execute repository commands, install dependencies, read secrets, or deploy applications. It generates and validates a deployment recipe for later execution. GitHub OAuth, private repository access, account selection, and real deployment remain deferred until explicit approval.
