# tools.hyperdata.nl

A REST composer for building and orchestrating REST API workflows.

## Overview

`tools.hyperdata.nl` is a Python toolkit for composing, chaining, and orchestrating REST API calls. It allows you to define multi-step API workflows declaratively and execute them as a single composed operation.

## Features

- Declarative REST workflow definitions
- Request chaining with data passing between steps
- Response transformation and mapping
- Error handling and retry strategies
- Authentication management across composed requests

## Getting Started

### Prerequisites

- Python 3.10+

### Installation

```bash
git clone https://github.com/casparkleijne/tools.hyperdata.nl.git
cd tools.hyperdata.nl
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
