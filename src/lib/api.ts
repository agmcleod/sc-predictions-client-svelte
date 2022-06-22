function getHeaders() {
  const token = '' //store.getState().currentUser.accessToken
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
}

const API_URL = import.meta.env.VITE_API_URL

function requestWithBody(
  url: string,
  method: 'post' | 'put',
  body?: any
): Promise<Response> {
  return fetch(`${API_URL}${url}`, {
    body: JSON.stringify(body),
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(),
    },
  })
}

function handleResult(response: Promise<Response>) {
  return response.then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      return res.json().then((body) => {
        throw body
      })
    }
  })
}

export async function getRequest<T>(url: string): Promise<T> {
  return handleResult(
    fetch(`${API_URL}${url}`, {
      headers: getHeaders(),
    })
  )
}

export async function postRequest<T>(url: string, body?: any): Promise<T> {
  return handleResult(requestWithBody(url, 'post', body))
}

export async function putRequest<T>(url: string, body?: any): Promise<T> {
  return handleResult(requestWithBody(url, 'put', body))
}

export async function delRequest(url: string) {
  return handleResult(
    fetch(`${API_URL}${url}`, {
      method: 'delete',
    })
  )
}
