import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { mockTasks, mockProjects, mockUsers, mockReviews } from '../fixtures/data'

export const handlers = [
  // Auth endpoints
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUsers[0],
    })
  }),

  http.get('/auth/v1/user', () => {
    return HttpResponse.json({
      user: mockUsers[0],
    })
  }),

  // Tasks endpoints
  http.get('/rest/v1/tasks', () => {
    return HttpResponse.json(mockTasks)
  }),

  http.post('/rest/v1/tasks', async ({ request }) => {
    const newTask = await request.json()
    const task = {
      id: `task-${Date.now()}`,
      user_id: mockUsers[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newTask,
    }
    return HttpResponse.json(task)
  }),

  http.patch('/rest/v1/tasks', async ({ request }) => {
    const updates = await request.json()
    const updatedTask = {
      ...mockTasks[0],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(updatedTask)
  }),

  http.delete('/rest/v1/tasks', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Projects endpoints
  http.get('/rest/v1/projects', () => {
    return HttpResponse.json(mockProjects)
  }),

  http.post('/rest/v1/projects', async ({ request }) => {
    const newProject = await request.json()
    const project = {
      id: `project-${Date.now()}`,
      user_id: mockUsers[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newProject,
    }
    return HttpResponse.json(project)
  }),

  http.patch('/rest/v1/projects', async ({ request }) => {
    const updates = await request.json()
    const updatedProject = {
      ...mockProjects[0],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(updatedProject)
  }),

  http.delete('/rest/v1/projects', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Reviews endpoints
  http.get('/rest/v1/reviews', () => {
    return HttpResponse.json(mockReviews)
  }),

  http.post('/rest/v1/reviews', async ({ request }) => {
    const newReview = await request.json()
    const review = {
      id: `review-${Date.now()}`,
      user_id: mockUsers[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newReview,
    }
    return HttpResponse.json(review)
  }),

  // Error handlers for testing error states
  http.get('/rest/v1/tasks/error', () => {
    return new HttpResponse('Internal Server Error', { status: 500 })
  }),

  http.post('/rest/v1/tasks/error', () => {
    return new HttpResponse('Bad Request', { status: 400 })
  }),
]

export const server = setupServer(...handlers)